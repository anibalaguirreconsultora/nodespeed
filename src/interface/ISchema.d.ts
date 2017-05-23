interface IModel {
    name: string
    base?: string
    _id:string
    properties: Array<IProperty>
    property:IPropertyCollection
    indexes: Array<IIndex>
    index:IIndexCollection
    relations: Array<IRelation>
    relation:IRelationCollection
    options?:IModelOptions
    _metadata?:IModelMetaData

}

interface IModelOptions {
    nodespeed?:IModelNodespeed,
    isSystemModel?:boolean
    definitionsFile: string
}

interface IModelMetaData {
    isDirty:boolean
}

interface IModelNodespeed {
    descriptionFieldId?:string
    primaryKeyId?:string
    primaryKey?:string
    layout?:INodespeedModelLayout
}

interface INodespeedModelLayout {
    grid:INodespeedModelLayoutGrid
    update:any
}

interface INodespeedModelLayoutGrid {
    columns:Array<string>
}

interface IProperty {
    name: string
    _id:string
    type:string
    nodespeed?:IPropertyNodespeed
}

interface IPropertyNodespeed {
    layout: IPropertyLayout
    isInherited:boolean
}

interface IPropertyLayout {
    default: IFormLayout
    grid: IFormLayout
    update: IFormLayout
}

interface IFormLayout {
    viewAs: string
}

interface IIndex {
    name: string
    _id:string
    nodespeed?:IIndexNodespeed
    keys?:any
}

interface IIndexNodespeed {
    isInherited?:boolean
}

interface IRelation {
    name: string
    type: string
    _id:string
    model:string
    foreignKey:string
    nodespeed?:IRelationNodespeed
    through?:string
}

interface IRelationNodespeed {
    _parentId?: string
    type: string
    modelId: string
    foreignKeyId: string
    throughId?:string
    isBaseRelation?:boolean

}

interface IModelCollection  {
    [name:string]: IModel
}

interface IIndexCollection  {
    [name:string]: IIndex
}

interface IRelationCollection  {
    [name:string]: IRelation
}

interface IPropertyCollection  {
    [name:string]: IProperty
}

interface IDictionary {

    register: {
        model(data:IModel):void
    }

    remove: {
        model(key:string):void
    }

    model: IModelCollection
    models: Array<IModel>
    index: IIndexCollection
    property: IPropertyCollection
    relation: IRelationCollection

    // models:Array<any>;

}

interface ISchema {
    dictionary:IDictionary
}

