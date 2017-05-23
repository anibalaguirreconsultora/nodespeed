/* tslint:disable */
import { Injectable } from '@angular/core';
import { User } from '../../models/User';
import { AccessToken } from '../../models/AccessToken';
import { Widget } from '../../models/Widget';
import { WidgetA } from '../../models/WidgetA';
import { WidgetB } from '../../models/WidgetB';
import { Store } from '../../models/Store';
import { StoreWithReplaceOnPUTfalse } from '../../models/StoreWithReplaceOnPUTfalse';
import { StoreWithReplaceOnPUTtrue } from '../../models/StoreWithReplaceOnPUTtrue';
import { Physician } from '../../models/Physician';
import { Patient } from '../../models/Patient';
import { Appointment } from '../../models/Appointment';
import { Customer } from '../../models/Customer';
import { Profile } from '../../models/Profile';
import { Nodespeed } from '../../models/Nodespeed';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    User: User,
    AccessToken: AccessToken,
    Widget: Widget,
    WidgetA: WidgetA,
    WidgetB: WidgetB,
    Store: Store,
    StoreWithReplaceOnPUTfalse: StoreWithReplaceOnPUTfalse,
    StoreWithReplaceOnPUTtrue: StoreWithReplaceOnPUTtrue,
    Physician: Physician,
    Patient: Patient,
    Appointment: Appointment,
    Customer: Customer,
    Profile: Profile,
    Nodespeed: Nodespeed,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
