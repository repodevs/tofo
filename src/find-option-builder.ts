import { ITEMS_PER_PAGE, DEFAULT_FILTER_KEYS } from './default-config';
import { FilterFactory } from './filter-factory';
import { Operator } from './lookup.enum';
import { difference } from 'lodash';

export class FindOptionBuilder {
  private expressQuery: any;
  private typeORMQuery: any;
  private originalQuery: any;

  constructor(queryObject: object) {
    this.expressQuery = { ...queryObject };
    this.originalQuery = { ...queryObject };
    this.typeORMQuery = {};
  }

  public build(): any {
    if (
      this.expressQuery['pagination'] === undefined ||
      this.expressQuery['pagination'] === true
    ) {
      this.setPage();
      this.setLimit();
    }
    delete this.expressQuery['pagination'];
    this.setOrder();
    this.setRelations();
    this.setFieldSelection();

    const factory = new FilterFactory();
    for (const queryItem in this.expressQuery) {
      factory
        .get(this.typeORMQuery, queryItem, this.expressQuery[queryItem])
        .buildQuery();
    }

    this.findAndsetOrQuery();

    return this.typeORMQuery;
  }

  public removeField(field: string): FindOptionBuilder {
    function deleteField(query: object) {
      for (const key in query) {
        if (query.hasOwnProperty(key)) {
          if (key.match(new RegExp(`^${field}$|^${field}__.*`))) {
            delete query[key];
          }
        }
      }
    }
    deleteField(this.originalQuery);
    if (this.originalQuery[Operator.OR]) {
      const queries: string[] = this.originalQuery[Operator.OR];
      let newORqueries: string[] = [];
      queries.forEach(query => {
        const parsed = this.parseOrCondition(query);
        deleteField(parsed);
        newORqueries.push(this.stringifyORCondition(parsed));
      });
      this.originalQuery[Operator.OR] = newORqueries;
    }
    this.updateExpressQuery();
    return this;
  }

  public getRelatedField(field: string) {
    const fields = {};
    function _getField(query: object) {
      for (const key in query) {
        if (query.hasOwnProperty(key)) {
          if (key.match(new RegExp(`^${field}$|^${field}__.*`))) {
            const v = query[key];
            fields[key] = v;
          }
        }
      }
    }
    _getField(this.originalQuery);
    return fields;
  }

  public setAllowedFields(lists: any[]): FindOptionBuilder {
    if (lists && lists.length) {
      let keys = lists.concat(DEFAULT_FILTER_KEYS);
      // In case any duplicate keys, remove it.
      keys = [...new Set(keys)];
      const filteredQuery = {};

      for (const key of keys) {
        const field = this.getRelatedField(key);
        Object.assign(filteredQuery, field);
      }

      const originalQuery = this.getRawQuery();
      const fieldShouldRemoves = difference(
        Object.keys(originalQuery),
        Object.keys(filteredQuery),
      );

      // Remove other keys that not in AllowedLists
      for (const field of fieldShouldRemoves) {
        this.removeField(field);
      }
    }

    return this;
  }

  public getRawQuery(): object {
    return this.originalQuery;
  }

  private setPage() {
    this.typeORMQuery['skip'] =
      this.expressQuery['page'] && this.expressQuery['page'] > 1
        ? (this.expressQuery['page'] - 1) *
          (this.expressQuery['limit'] || ITEMS_PER_PAGE)
        : 0;
    delete this.expressQuery['page'];
  }

  private setLimit() {
    this.typeORMQuery['take'] =
      this.expressQuery['limit'] && this.expressQuery['limit'] > 0
        ? this.expressQuery['limit']
        : ITEMS_PER_PAGE;
    delete this.expressQuery['limit'];
  }

  private setRelations() {
    if (!this.expressQuery['join']) return;
    const relations = this.expressQuery['join']
      .split(',')
      .map((key: string) => key.trim());
    this.typeORMQuery['relations'] = relations;
    delete this.expressQuery['join'];
  }

  private setFieldSelection() {
    if (!this.expressQuery['select']) return;
    const fields = this.expressQuery['select']
      .split(',')
      .map((key: string) => key.trim());
    this.typeORMQuery['select'] = fields;
    delete this.expressQuery['select'];
  }

  private findAndsetOrQuery() {
    if (!this.expressQuery[Operator.OR]) return;
    let conditions: string[] = this.expressQuery[Operator.OR];
    if (!Array.isArray(conditions)) conditions = [conditions];
    const factory = new FilterFactory();
    const andCond = this.typeORMQuery['where'];
    this.typeORMQuery['where'] = [];

    conditions.forEach(condition => {
      const parsed = this.parseOrCondition(condition);
      const findOpts = {};
      for (const queryItem in parsed) {
        factory.get(findOpts, queryItem, parsed[queryItem]).buildQuery();
      }
      this.typeORMQuery['where'].push({ ...findOpts['where'], ...andCond });
    });
    delete this.expressQuery[Operator.OR];
  }

  private parseOrCondition(query: string): object {
    const result = {};
    const fields = query.split('|');
    fields.forEach(field => {
      const keyValue = field.split(':');
      result[keyValue[0]] = keyValue[1];
    });
    return result;
  }

  private stringifyORCondition(query: object): string {
    let result = '';
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        const value = query[key];
        result += `${key}:${value}|`;
      }
    }
    return result.substr(0, result.length - 1);
  }

  private setOrder() {
    if (!this.expressQuery['order']) {
      return;
    }
    const orderFields = this.expressQuery['order'].split(',');
    for (const field of orderFields) {
      const orderCriteria = this.getOrderCriteria(field);
      this.typeORMQuery['order'] = {
        ...this.typeORMQuery['order'],
        [field.substr(1, field.length)]: orderCriteria
      };
    }
    delete this.expressQuery['order'];
  }

  private getOrderCriteria(field: string): string {
    if (field.startsWith('^')) {
      return 'ASC';
    } else if (field.startsWith('-')) {
      return 'DESC';
    } else {
      throw new Error(
        `No order set for <${field}>. Prefix with one of these: [^, -]`
      );
    }
  }

  private updateExpressQuery() {
    this.expressQuery = { ...this.originalQuery };
  }
}
