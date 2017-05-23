/* tslint:disable */
import {
  Physician,
  Patient
} from '../index';

declare var Object: any;
export interface AppointmentInterface {
  "date"?: Date;
  "id"?: number;
  "physicianId"?: number;
  "patientId"?: number;
  physician?: Physician;
  patient?: Patient;
}

export class Appointment implements AppointmentInterface {
  "date": Date;
  "id": number;
  "physicianId": number;
  "patientId": number;
  physician: Physician;
  patient: Patient;
  constructor(data?: AppointmentInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Appointment`.
   */
  public static getModelName() {
    return "Appointment";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Appointment for dynamic purposes.
  **/
  public static factory(data: AppointmentInterface): Appointment{
    return new Appointment(data);
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
      name: 'Appointment',
      plural: 'Appointments',
      properties: {
        "date": {
          name: 'date',
          type: 'Date'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
        "physicianId": {
          name: 'physicianId',
          type: 'number'
        },
        "patientId": {
          name: 'patientId',
          type: 'number'
        },
      },
      relations: {
        physician: {
          name: 'physician',
          type: 'Physician',
          model: 'Physician'
        },
        patient: {
          name: 'patient',
          type: 'Patient',
          model: 'Patient'
        },
      }
    }
  }
}
