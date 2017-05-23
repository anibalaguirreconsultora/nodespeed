/* tslint:disable */

declare var Object: any;
export interface NodespeedInterface {
  "id"?: number;
}

export class Nodespeed implements NodespeedInterface {
  "id": number;
  constructor(data?: NodespeedInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Nodespeed`.
   */
  public static getModelName() {
    return "Nodespeed";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Nodespeed for dynamic purposes.
  **/
  public static factory(data: NodespeedInterface): Nodespeed{
    return new Nodespeed(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'Nodespeed',
      plural: 'nodespeed',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
