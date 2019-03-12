import {inspect} from 'util';

interface IArrayOrder extends Array<string | IArrayOrder>{
  name: string,
  type?: string,
  kind?: string,
  isActive?: boolean,
  isDisabled?: boolean,
  subsections?: IArrayOrder,
}

const createOrderedArray = (order: IArrayOrder, src: any) => {
  const out: any[] = [];

  for (const value of order) {
    console.log(value);
    if (typeof value === 'object') {
      if (value.subsections) {
        src[value.name].subsections = createOrderedArray(value.subsections, src[value.name].subsections);
      }
      src[value.name].name = value.name;
      src[value.name] = {...src[value.name], ...value, subsections: src[value.name].subsections}
      out.push(src[value.name]);
    }
    else {
      src[value].name = value;
      out.push(src[value]);
    }
  }

  return out;
}

const getBaseSchema = (model: any) => {
  const baseSchema: any = {};

  model.schema.eachPath((path: string, type: any) => {
    baseSchema[path] = type;
    if (type.instance === 'Array') {
      baseSchema[path].caster.regex = `${type.caster.options.validate}`;
    } else {
      baseSchema[path].regex = `${type.options.validate}`;
    }
  });

  return baseSchema;
}

const buildStructure = (schemaData: any) => {
  const structure: any = {};

  for (const [key, value] of Object.entries(schemaData) as [string, any]) {
    if (key.includes('.')) {
      const parts = key.split('.');
      const newKey = parts.shift();

      if (!structure[newKey]) {
        structure[newKey] = {isActive: true, name: newKey, subsections: {}};
      }
      console.log(structure[newKey]);

      structure[newKey].subsections[parts[0]] = buildStructure({[parts.join('.')]: value})[parts[0]];
    } else {
      structure[key] = {};
      structure[key].isActive = true;
      structure[key].isDisabled = false;

      if (value.instance === "Array") {
        structure[key].isArray = true;
        structure[key].type = value.caster.instance;
        if (value.caster.regex !== 'undefined') { structure[key].regex = value.caster.regex; }
        structure[key].required = !!value.caster.options.required;
        structure[key].enum = value.caster.enumValues;
        if (value.caster.options.ref !== 'undefined') { structure[key].references = value.caster.options.ref; }
      } else {
        structure[key].isArray = false;
        structure[key].type = value.instance;
        if (value.regex !== 'undefined') { structure[key].regex = value.regex; }
        structure[key].required = !!value.options.required;
        structure[key].enum = value.enumValues;
        if (value.options.ref !== 'undefined') { structure[key].references = value.options.ref; }
      }
    }
  }

  return structure;
}

const getFullStructure = (order: any, model: any) => {
  return createOrderedArray(order, buildStructure(getBaseSchema(model)));
}

export {
  createOrderedArray,
  getBaseSchema,
  buildStructure,
  getFullStructure
};