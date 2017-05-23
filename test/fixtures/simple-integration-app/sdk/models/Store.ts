/* tslint:disable */
import {
  Widget
} from '../index';

declare var Object: any;
export interface StoreInterface {
  "id"?: number;
  widgets?: Widget[];
}

export class Store implements StoreInterface {
  "id": number;
  widgets: Widget[];
  constructor(data?: StoreInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Store`.
   */
  public static getModelName() {
    return "Store";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Store for dynamic purposes.
  **/
  public static factory(data: StoreInterface): Store{
    return new Store(data);
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
      name: 'Store',
      plural: 'Stores',
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
