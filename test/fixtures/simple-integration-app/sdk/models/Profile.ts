/* tslint:disable */

declare var Object: any;
export interface ProfileInterface {
  "points"?: number;
  "id"?: number;
  "customerId"?: number;
}

export class Profile implements ProfileInterface {
  "points": number;
  "id": number;
  "customerId": number;
  constructor(data?: ProfileInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Profile`.
   */
  public static getModelName() {
    return "Profile";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Profile for dynamic purposes.
  **/
  public static factory(data: ProfileInterface): Profile{
    return new Profile(data);
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
      name: 'Profile',
      plural: 'Profiles',
      properties: {
        "points": {
          name: 'points',
          type: 'number'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
        "customerId": {
          name: 'customerId',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
