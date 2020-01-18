export module Project {
  export class Model {
    name: string;
    vars: Variable[];
  }

  export class Variable {
    name: string;
    type: string;
    optional: boolean;
    value?: string;
  }
}
