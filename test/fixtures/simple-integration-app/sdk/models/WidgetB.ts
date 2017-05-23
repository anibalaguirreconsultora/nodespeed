/* tslint:disable */
import {
  Store
} from '../index';

declare var Object: any;
export interface WidgetBInterface {
  "nameB"?: string;
  "nameA"?: string;
  "name"?: string;
  "id"?: number;
  "storeId"?: number;
  store?: Store;
}

export class WidgetB implements WidgetBInterface {
  "nameB": string;
  "nameA": string;
  "name": string;
  "id": number;
  "storeId": number;
  store: Store;
  constructor(data?: WidgetBInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `WidgetB`.
   */
  public static getModelName() {
    return "WidgetB";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of WidgetB for dynamic purposes.
  **/
  public static factory(data: WidgetBInterface): WidgetB{
    return new WidgetB(data);
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
      name: 'WidgetB',
      plural: 'WidgetBs',
      properties: {
        "nameB": {
          name: 'nameB',
          type: 'string',
          default: 'DefaultWidgetName'
        },
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
