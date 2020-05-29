import { ITEMS_PER_PAGE } from './default-config';
import { FilterFactory } from './filter-factory';
import { Condition } from './lookup.enum';

export class QueryBuilder {
  private expressQuery: any;
  private typeORMQuery: any;

  constructor(expressQuery: any) {
    this.expressQuery = expressQuery;
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
    if (!this.expressQuery[Condition.OR]) return;
    let conditions: string[] = this.expressQuery[Condition.OR];
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
    delete this.expressQuery[Condition.OR];
  }

  private parseOrCondition(query: string) {
    const result = {};
    const fields = query.split('|');
    fields.forEach(field => {
      const keyValue = field.split(':');
      result[keyValue[0]] = keyValue[1];
    });
    return result;
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
    if (field.startsWith('+')) {
      return 'ASC';
    } else if (field.startsWith('-')) {
      return 'DESC';
    } else {
      throw new Error(
        `No order set for <${field}>. Prefix with one of these: [+, -]`
      );
    }
  }
}
