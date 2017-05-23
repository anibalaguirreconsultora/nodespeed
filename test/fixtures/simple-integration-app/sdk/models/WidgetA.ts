/* tslint:disable */
import {
  Store
} from '../index';

declare var Object: any;
export interface WidgetAInterface {
  "nameA"?: string;
  "name"?: string;
  "id"?: number;
  "storeId"?: number;
  store?: Store;
}

export class WidgetA implements WidgetAInterface {
  "nameA": string;
  "name": string;
  "id": number;
  "storeId": number;
  store: Store;
  constructor(data?: WidgetAInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `WidgetA`.
   */
  public static getModelName() {
    return "WidgetA";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of WidgetA for dynamic purposes.
  **/
  public static factory(data: WidgetAInterface): WidgetA{
    return new WidgetA(data);
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
      name: 'WidgetA',
      plural: 'Widgeta',
      properties: {
        "nameA": {
          name: 'nameA',
          type: 'string',
          default: 'DefaultWidgetName'
        },
        "name": {
          name: 'name',
          type: 'string',
          default: 'DefaultWidgetName'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
        "storeId": {
          name: 'storeId',
          type: 'number'
        },
      },
      relations: {
        store: {
          name: 'store',
          type: 'Store',
          model: 'Store'
        },
      }
    }
  }
}
