import { promisify } from 'util';
import { readFile, writeFile, readdir, mkdir, rename, exists } from 'fs';
import * as dirTree from 'directory-tree';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as Koa from 'koa';

const pReadFile = promisify(readFile);
const pWriteFile = promisify(writeFile);
const pReaddir = promisify(readdir);
const pMkdir = promisify(mkdir);
const pRename = promisify(rename);
const pExists = promisify(exists);

// ANCHOR definitions

interface IBuiltResponse {
  errors?: string[],
  warnings?: string[],
  content?: any
}
interface IBackupData {
  "enabled": {
    "6hr": boolean,
    "daily": boolean,
    "weekly": boolean,
    "monthly": boolean,
    "undo": boolean
  },
  "undoLimit": number,
  "lastBackup": {
    "6hr": number,
    "daily": number,
    "weekly": number,
    "monthly": number,
    "undo": [number]
  }
}
type intervals = '6hr' | 'daily' | 'weekly' | 'monthly';
const validIntervals = ['6hr', 'daily', 'weekly', 'monthly'];

// ANCHOR helpers

const formatBackup = (data: object[]) => {
  if (data.length === 0) return '[]';
  let formatted = '[\n';
  for (const entry of data) {
    formatted += JSON.stringify(entry) + ',\n';
  }
  return formatted.substring(0, formatted.length - 2) + '\n]';
}

const sendErr = (ctx: Koa.ParameterizedContext<any, {}>, code: number, msg: string) => {
  ctx.status = code;
  ctx.body = {errors: [msg]};
}

// ANCHOR getters

export const getBackedUp = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  ctx.body = {content: await dirTree(`${__dirname}/data`)};
}

export const getSnapshots = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  ctx.body = {content: await dirTree(`${__dirname}/data/_snapshots`)};
}

export const getBackupData = async (ctx: Koa.ParameterizedContext<any, {}>, path: string) => {
  ctx.body = {content: await pReadFile(path)};
}

// ANCHOR main functions

/**
 * forces all databases to backup to a specified timeslot
 * @param ctx the koa context
 */
export const backup = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const builtResponse: IBuiltResponse = {};
  const { timeSlot } = ctx.query;

  if (!validIntervals.includes(timeSlot)) {
    ctx.status = 400;
    builtResponse.errors.push(`interval provided does not exist!\nvalid intervals: ${validIntervals.join(', ')}`)
    return;
  }

  for (const name of mongoose.modelNames()) {
    const model = mongoose.model(name);
    const data = await model.find({});

    await pWriteFile(`${__dirname}/data/${timeSlot}/${name}.json`, formatBackup(data));
  }
  ctx.status = 200;
  ctx.body = builtResponse;
}

/**
 * saves a 'snapshot' of the given databases to the _snapshots
 * folder named after the current time
 * @param ctx the koa contenxt
 */
export const snapshot = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const builtResponse: IBuiltResponse = {};
  const { DBNames } = ctx.query;
  const existing = mongoose.modelNames();
  const timestamp = moment().format('YYYY-MM-DD--HH-mm-ss')

  // ensures the directory does not exist
  if (!await pExists(`${__dirname}/data/_snapshots/${timestamp}`)) { await pMkdir(`${__dirname}/data/_snapshots/${timestamp}`); }

  if (DBNames) {
    let invalidNames = [];
    for (const name of DBNames.split(',')) {
      if (!existing.includes(name)) {
        invalidNames.push(name);
        continue;
      }

      const model = mongoose.model(name);
      const data = await model.find({});

      await pWriteFile(`${__dirname}/data/${timestamp}/${name}.json`, formatBackup(data));
    }
    if (invalidNames.length > 0) {
      builtResponse.warnings.push(`the following databases do not exist: ${invalidNames.join(', ')}`);
    }
  } else {
    for (const name of mongoose.modelNames()) {
      const model = mongoose.model(name);
      const data = await model.find({});

      await pWriteFile(`${__dirname}/data/${timestamp}/${name}.json`, formatBackup(data));
    }
  }

  ctx.status = 200;
  ctx.body = builtResponse;
}

/**
 * loads the data from a given snapshot into the database
 * OR loads the data from a given timeslot into the database
 * (if the timeslot is set to 'snapshot' and 'snapshot' is valid)
 * @param ctx the koa context
 */
export const restore = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const builtResponse: IBuiltResponse = {};
  const { DBName, timeslot, snapshot } = ctx.query;
  if (!mongoose.modelNames().includes(DBName)) { return sendErr(ctx, 400, 'that database does not exist'); }

  const model = mongoose.model(DBName);
  let data = {};

  if (timeslot === 'snapshot') {
    if (!(await pReaddir(`${__dirname}/data/_snapshots`)).includes(snapshot)) { return sendErr(ctx, 400, 'when loading from a snapshot a valid timestamp must be supplied') }

    data = JSON.parse(await pReadFile(`${__dirname}/data/_snapshots/${snapshot}/${DBName}.json`, 'utf8'));
    await model.deleteMany({});
    await model.create(data);
  } else {
    if (!validIntervals.includes(timeslot)) { return sendErr(ctx, 400, 'please provide a valid timeslot to load from') }

    data = JSON.parse(await pReadFile(`${__dirname}/data/${timeslot}/${DBName}.json`, 'utf8'));
    await model.deleteMany({});
    await model.create(data);
  }

  ctx.status = 200;
}

// ANCHOR backup loop

const autoBackup = async (timeslots: intervals[]) => {
  for (const DBName of mongoose.modelNames()) {
    const model = mongoose.model(DBName);
    const data = await model.find({});

    for (const timeslot of timeslots) {
      await pWriteFile(`${__dirname}/data/${timeslot}/${model.modelName}.json`, formatBackup(data));
    }
  }
}

/**
 * works together with the autoBackup function to automatically
 * update the backups set to backup on a set interval
 * (6hr, daily, weekly, monthly)
 */
export const mainLoop = async () => {
  const backupData: IBackupData = JSON.parse(await pReadFile(`${__dirname}/backupData.json`, 'utf8'));
  const currentTime = Date.now();

  let toBackup: intervals[] = [];
  const { lastBackup } = backupData;
  const { enabled } = backupData;
  if (enabled['6hr'] && !lastBackup['6hr'] || moment.duration(currentTime - lastBackup['6hr']).hours() >= 6) toBackup.push('6hr');
  if (enabled['daily'] && !lastBackup['daily'] || moment.duration(currentTime - lastBackup['daily']).hours() >= 24) toBackup.push('daily');
  if (enabled['weekly'] && !lastBackup['weekly'] || moment.duration(currentTime - lastBackup['weekly']).weeks() >= 1) toBackup.push('weekly');
  if (enabled['monthly'] && !lastBackup['monthly'] || moment.duration(currentTime - lastBackup['monthly']).months() >= 1) toBackup.push('monthly');

  autoBackup(toBackup);
  for (const time of toBackup) {
    lastBackup[time] = currentTime;
  }
}

