/* tslint:disable */
import {
  Widget
} from '../index';

declare var Object: any;
export interface StoreWithReplaceOnPUTfalseInterface {
  "id"?: number;
  widgets?: Widget[];
}

export class StoreWithReplaceOnPUTfalse implements StoreWithReplaceOnPUTfalseInterface {
  "id": number;
  widgets: Widget[];
  constructor(data?: StoreWithReplaceOnPUTfalseInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `StoreWithReplaceOnPUTfalse`.
   */
  public static getModelName() {
    return "StoreWithReplaceOnPUTfalse";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of StoreWithReplaceOnPUTfalse for dynamic purposes.
  **/
  public static factory(data: StoreWithReplaceOnPUTfalseInterface): StoreWithReplaceOnPUTfalse{
    return new StoreWithReplaceOnPUTfalse(data);
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
      name: 'StoreWithReplaceOnPUTfalse',
      plural: 'stores-updating',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
        widgets: {
          name: 'widgets',
          type: 'Widget[]',
          model: 'Widget'
        },
      }
    }
  }
}
