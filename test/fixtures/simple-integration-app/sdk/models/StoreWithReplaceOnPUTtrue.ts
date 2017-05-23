/* tslint:disable */
import {
  Widget
} from '../index';

declare var Object: any;
export interface StoreWithReplaceOnPUTtrueInterface {
  "id"?: number;
  widgets?: Widget[];
}

export class StoreWithReplaceOnPUTtrue implements StoreWithReplaceOnPUTtrueInterface {
  "id": number;
  widgets: Widget[];
  constructor(data?: StoreWithReplaceOnPUTtrueInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `StoreWithReplaceOnPUTtrue`.
   */
  public static getModelName() {
    return "StoreWithReplaceOnPUTtrue";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of StoreWithReplaceOnPUTtrue for dynamic purposes.
  **/
  public static factory(data: StoreWithReplaceOnPUTtrueInterface): StoreWithReplaceOnPUTtrue{
    return new StoreWithReplaceOnPUTtrue(data);
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
      name: 'StoreWithReplaceOnPUTtrue',
      plural: 'stores-replacing',
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
