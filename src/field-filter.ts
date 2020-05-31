import {
  Between,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not
} from 'typeorm';
import { AbstractFilter } from './filter';
import { LookupFilter, Operator } from './lookup.enum';
import { mergeDeep } from './utils/deep-merge';

export class FieldFilter extends AbstractFilter {
  private notOperator: boolean;
  private hierarchy: string[];

  constructor(
    query: any,
    prop: string,
    lookup: LookupFilter,
    value: string,
    notOperator: boolean = false,
    hierarchy?: string[]
  ) {
    super(query, prop, lookup, value);
    this.notOperator = notOperator;
    this.hierarchy = hierarchy;
  }

  public buildQuery() {
    let queryToAdd;

    switch (this.lookup) {
      case LookupFilter.EXACT:
        if (this.prop !== Operator.OR) queryToAdd = { [this.prop]: this.value };
        break;
      case LookupFilter.CONTAINS:
        queryToAdd = { [this.prop]: Like(`%${this.value}%`) };
        break;
      case LookupFilter.STARTS_WITH:
        queryToAdd = { [this.prop]: Like(`${this.value}%`) };
        break;
      case LookupFilter.ENDS_WITH:
        queryToAdd = { [this.prop]: Like(`%${this.value}`) };
        break;
      case LookupFilter.IS_NULL:
        queryToAdd = { [this.prop]: IsNull() };
        break;
      case LookupFilter.LT:
        queryToAdd = { [this.prop]: LessThan(this.value) };
        break;
      case LookupFilter.LTE:
        queryToAdd = { [this.prop]: LessThanOrEqual(this.value) };
        break;
      case LookupFilter.GT:
        queryToAdd = { [this.prop]: MoreThan(this.value) };
        break;
      case LookupFilter.GTE:
        queryToAdd = { [this.prop]: MoreThanOrEqual(this.value) };
        break;
      case LookupFilter.IN:
        queryToAdd = { [this.prop]: In(this.value.split(',')) };
        break;
      case LookupFilter.BETWEEN:
        const rangeValues = this.value.split(',');
        queryToAdd = { [this.prop]: Between(+rangeValues[0], +rangeValues[1]) };
        break;
    }
    if (this.notOperator) {
      queryToAdd[this.prop] = Not(queryToAdd[this.prop]);
    }
    if (this.hierarchy) {
      let last = {};
      let result = last;

      for (let index = 0; index < this.hierarchy.length; index++) {
        const key = this.hierarchy[index];
        last[key] = {};
        if (index !== this.hierarchy.length - 1) {
          last = last[key];
        } else {
          last[key] = queryToAdd;
        }
      }

      queryToAdd = result;
    }
    const result = mergeDeep(this.query['where'], queryToAdd);
    if (result) this.query['where'] = result;
  }
}
