/* tslint:disable */
import {
  Store
} from '../index';

declare var Object: any;
export interface WidgetInterface {
  "name"?: string;
  "id"?: number;
  "storeId"?: number;
  "storeWithReplaceOnPUTfalseId"?: number;
  "storeWithReplaceOnPUTtrueId"?: number;
  store?: Store;
}

export class Widget implements WidgetInterface {
  "name": string;
  "id": number;
  "storeId": number;
  "storeWithReplaceOnPUTfalseId": number;
  "storeWithReplaceOnPUTtrueId": number;
  store: Store;
  constructor(data?: WidgetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Widget`.
   */
  public static getModelName() {
    return "Widget";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Widget for dynamic purposes.
  **/
  public static factory(data: WidgetInterface): Widget{
    return new Widget(data);
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
      name: 'Widget',
      plural: 'Widgets',
      properties: {
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
        "storeWithReplaceOnPUTfalseId": {
          name: 'storeWithReplaceOnPUTfalseId',
          type: 'number'
        },
        "storeWithReplaceOnPUTtrueId": {
          name: 'storeWithReplaceOnPUTtrueId',
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
