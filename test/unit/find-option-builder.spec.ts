import { Like, MoreThan, MoreThanOrEqual } from 'typeorm';
import { ITEMS_PER_PAGE } from '../../src/default-config';
import { FindOptionBuilder } from '../../src/find-option-builder';

describe('Test FindOption Builder #build', () => {
  it('should build a query with an exact & contains filter', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      join: 'posts,comments',
      select: 'name,phoneNumber'
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      },
      relations: ['posts', 'comments'],
      select: ['name', 'phoneNumber'],
      skip: 0,
      take: ITEMS_PER_PAGE
    });
  });

  it('should build a query with skip equals to 0 and take equals to ITEMS_PER_PAGE', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 1
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      },
      skip: 0,
      take: ITEMS_PER_PAGE
    });
  });

  it('should build a query with skip equals to ITEMS_PER_PAGE and take equals to ITEMS_PER_PAGE', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 2
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      },
      skip: ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE
    });
  });

  it('should build a query with skip equals to 50 and take equals to ITEMS_PER_PAGE', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 3
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      },
      skip: 50,
      take: ITEMS_PER_PAGE
    });
  });

  it('should build a query with skip equals to 20 and take equals to 10', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 3,
      limit: 10
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      },
      skip: 20,
      take: 10
    });
  });

  it('should build a query with no paginated results when pagination equals to false', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      pagination: false
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      }
    });
  });

  it('should build a query with paginated results when pagination equals to true', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      pagination: true
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      },
      skip: 0,
      take: ITEMS_PER_PAGE
    });
  });

  it('should build a query with paginated results when pagination equals undefined', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com'
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%')
      },
      skip: 0,
      take: ITEMS_PER_PAGE
    });
  });
});

describe('Test FindOptionBuilder #setPage', () => {
  it('should return a skip equals to 0 when page property is not provided', () => {
    const findOptionBuilder: any = new FindOptionBuilder({});
    findOptionBuilder.setPage();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      skip: 0
    });
  });

  it('should return a skip equals to 0 when page equals to 1', () => {
    const findOptionBuilder: any = new FindOptionBuilder({
      page: 1
    });
    findOptionBuilder.setPage();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      skip: 0
    });
  });

  it('should return a skip equals to ITEMS_PER_PAGE when page equals to 2', () => {
    const findOptionBuilder: any = new FindOptionBuilder({
      page: 2
    });
    findOptionBuilder.setPage();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      skip: ITEMS_PER_PAGE
    });
  });
});

describe('Test FindOptionBuilder #setLimit', () => {
  it('should return a take equals to ITEMS_PER_PAGE when limit is not provided', () => {
    const findOptionBuilder: any = new FindOptionBuilder({});
    findOptionBuilder.setLimit();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      take: ITEMS_PER_PAGE
    });
  });

  it('should return a take equals to ITEMS_PER_PAGE when limit equals to 0', () => {
    const findOptionBuilder: any = new FindOptionBuilder({
      limit: 0
    });
    findOptionBuilder.setLimit();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      take: ITEMS_PER_PAGE
    });
  });

  it('should return a take equals to 1 when limit equals to 1', () => {
    const findOptionBuilder: any = new FindOptionBuilder({
      limit: 1
    });
    findOptionBuilder.setLimit();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      take: 1
    });
  });
});

describe('Test FindOptionBuilder #setOrder', () => {
  it('should return a query with no order property', () => {
    const findOptionBuilder: any = new FindOptionBuilder({});
    findOptionBuilder.setOrder();
    expect(findOptionBuilder.typeORMQuery).toEqual({});
  });

  it('should return a query with order equals to foo:ASC', () => {
    const findOptionBuilder: any = new FindOptionBuilder({
      order: '^foo'
    });
    findOptionBuilder.setOrder();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      order: {
        foo: 'ASC'
      }
    });
  });

  it('should return a query with order equals to foo:DESC', () => {
    const findOptionBuilder: any = new FindOptionBuilder({
      order: '-foo'
    });
    findOptionBuilder.setOrder();
    expect(findOptionBuilder.typeORMQuery).toEqual({
      order: {
        foo: 'DESC'
      }
    });
  });

  it('should thrown an error when order criteria is not provided', () => {
    const findOptionBuilder: any = new FindOptionBuilder({
      order: 'foo'
    });
    expect(() => findOptionBuilder.setOrder()).toThrow();
  });
});

describe('Test FindOptionBuilder #getOrderCriteria', () => {
  it('should return a query with order equals to foo:ASC', () => {
    const findOptionBuilder: any = new FindOptionBuilder({});
    const orderCriteria = findOptionBuilder.getOrderCriteria('^foo');
    expect(orderCriteria).toBe('ASC');
  });

  it('should return a query with order equals to foo:DESC', () => {
    const findOptionBuilder: any = new FindOptionBuilder({});
    const orderCriteria = findOptionBuilder.getOrderCriteria('-foo');
    expect(orderCriteria).toBe('DESC');
  });

  it('should thrown an error when order criteria is not provided', () => {
    const findOptionBuilder: any = new FindOptionBuilder({});
    expect(() => {
      findOptionBuilder.getOrderCriteria('foo');
    }).toThrow();
  });

  it('should build simple OR type condition', () => {
    const findOptionBuilder = new FindOptionBuilder({
      $or: 'name:juste|age__gte:15',
      pagination: false
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: [{ name: 'juste', age: MoreThanOrEqual('15') }]
    });
  });

  it('should build several OR type condition unions', () => {
    const findOptionBuilder = new FindOptionBuilder({
      $or: ['name:juste|age__gte:15', 'user.role:admin'],
      pagination: false
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: [
        { name: 'juste', age: MoreThanOrEqual('15') },
        { user: { role: 'admin' } }
      ]
    });
  });

  it('should build several union of condition of type OR combined with a basic condition AND', () => {
    const findOptionBuilder = new FindOptionBuilder({
      $or: ['name:juste|age__gte:15', 'user.role:admin'],
      city: 'Dahomey',
      pagination: false
    });
    const build = findOptionBuilder.build();
    expect(build).toEqual({
      where: [
        { name: 'juste', city: 'Dahomey', age: MoreThanOrEqual('15') },
        { user: { role: 'admin' }, city: 'Dahomey' }
      ]
    });
  });

  it('Should delete the field before building it', () => {
    const findOptionBuilder = new FindOptionBuilder({
      name: 'Bossa',
      name__isnull: true,
      $or: ['name__endswith:ey|size__gt:18'],
      pagination: false
    });
    findOptionBuilder.removeField('name');
    expect(findOptionBuilder.build()).toEqual({
      where: [{ size: MoreThan('18') }]
    });
  });

  it('Should delete the field not in allowed lists before building it', () => {
    const findOptionBuilder = new FindOptionBuilder({
      not_allowed_field1: 'Spammer',
      not_allowed_field1__like: 'Trash',
      allowed_field1: 'Love',
      allowed_field2: 'Peace',
      $or: ['not_allowed_field1__endswith:ey|age__gt:15'],
      pagination: false
    });
    findOptionBuilder.setAllowedFields(['allowed_field1', 'allowed_field2', 'age'])
    expect(findOptionBuilder.build()).toEqual({
      where: [{ age: MoreThan('15'), allowed_field1: 'Love', allowed_field2: 'Peace'}]
    });
  });

});
