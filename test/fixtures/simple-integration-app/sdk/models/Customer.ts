/* tslint:disable */
import {
  Profile
} from '../index';

declare var Object: any;
export interface CustomerInterface {
  "name": string;
  "age"?: number;
  "size"?: number;
  "id"?: number;
  profile?: Profile;
}

export class Customer implements CustomerInterface {
  "name": string;
  "age": number;
  "size": number;
  "id": number;
  profile: Profile;
  constructor(data?: CustomerInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Customer`.
   */
  public static getModelName() {
    return "Customer";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Customer for dynamic purposes.
  **/
  public static factory(data: CustomerInterface): Customer{
    return new Customer(data);
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
      name: 'Customer',
      plural: 'Customers',
      properties: {
        "name": {
          name: 'name',
          type: 'string'
        },
        "age": {
          name: 'age',
          type: 'number'
        },
        "size": {
          name: 'size',
          type: 'number'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
        profile: {
          name: 'profile',
          type: 'Profile',
          model: 'Profile'
        },
      }
    }
  }
}
