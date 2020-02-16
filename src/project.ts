export module Project {
  export class Request {
    name: string
    vars: Variable[]
    path: string
    method: string
    response_type: string
    error_type: string
    constructor(name: string, vars: Variable[], path: string, method: string, response_type: string, error_type: string) {
      this.name = name
      this.vars = vars
      this.path = path
      this.method = method
      this.response_type = response_type
      this.error_type = error_type
    }
  }

  export function normalizeModelType(model: Model): Model {
    model.vars.forEach(variable => {
      normalizeVariableType(variable)
    })
    return model
  };
  export function normalizeRequestType(request: Request): Request {
    request.vars.forEach(variable => {
      normalizeVariableType(variable)
    })
    return request
  };

  function normalizeVariableType(variable: Variable): Variable {
    variable.type = Variable.typeFrom(variable.type)
    return variable
  }
  export class Model {
    name: string
    vars: Variable[]


    constructor(name: string, vars: Variable[]) {
      this.name = name
      this.vars = vars
    }
  }

  export class BaseVariable {
    name: string
    type: string
    optional: boolean
    value?: string
  }

  export class Variable extends BaseVariable {
    constructor(name: string, type: string, optional: boolean, value?: string) {
      super();
      this.name = name
      this.type = type
      this.optional = optional
      this.value = value
    }

    public toJSON() {
      const type = this.typeFor(this.type)

      return {
        name: this.name,
        type: type,
        optional: this.optional,
        value: this.value
      };

    }
    typeFor(type: string): any {
      if (type[0] == "[") {
        return { Array: this.typeFor(type.substr(1, type.length - 2)) }
      }
      if (["String", "Bool", "Int", "Float"].includes(type)) {
        return type
      }

      return { Complex: type }
    }



    public static fromJSON(json: any): Variable {
      console.log("FROM CALLLED")
      const type = Variable.typeFrom(json["type"])
      console.log(type)
      let variable = Object.create(Variable.prototype);
      return Object.assign(variable, json, {
        type: type
      });
    }


    static typeFrom(type: any): string {
      if (typeof type === 'string' || type instanceof String) {
        return type as string
      }
      if (typeof type == 'object') {
        const obj = type as object
        if (obj["Complex"] != undefined) {
          return obj["Complex"]
        }
        if (obj["Array"] != undefined) {
          return "[" + this.typeFrom(obj["Array"]) + "]"
        }
      }
      return "idk"
    }
  }
}
