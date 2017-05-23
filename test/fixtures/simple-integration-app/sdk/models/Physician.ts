/* tslint:disable */
import {
  Patient
} from '../index';

declare var Object: any;
export interface PhysicianInterface {
  "name"?: string;
  "id"?: number;
  patients?: Patient[];
}

export class Physician implements PhysicianInterface {
  "name": string;
  "id": number;
  patients: Patient[];
  constructor(data?: PhysicianInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Physician`.
   */
  public static getModelName() {
    return "Physician";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Physician for dynamic purposes.
  **/
  public static factory(data: PhysicianInterface): Physician{
    return new Physician(data);
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
      name: 'Physician',
      plural: 'Physicians',
      properties: {
        "name": {
          name: 'name',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
        patients: {
          name: 'patients',
          type: 'Patient[]',
          model: 'Patient'
        },
      }
    }
  }
}
