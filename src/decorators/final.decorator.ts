type Constructor = { new (...args: any[]): object };

/**
 * @description Forbids decorated class from being extended
 * @example 
 * -@Final
 * -class Example { ... }
 * 
 * class ExampleExt extends Example { ... }
 * throw "Final class "Example" cannot be extended"
 * */
export function Final<T extends Constructor>(
  target: T,
): T {
  class Final extends target {
    constructor(...args: any[]) {
      if (new.target !== Final) {
        throw new Error(`Final class "${target.name}" cannot be extended`);
      }
      super(...args);
    }
  };

  return Final;
}