import { FilterFactory } from '../../src/filter-factory';
import { FindOptionBuilder } from '../../src/find-option-builder';
import { Like, IsNull, MoreThan, MoreThanOrEqual, LessThanOrEqual, LessThan } from 'typeorm';

describe('Test FieldFilter', () => {

  const filterFactory = new FilterFactory();
  const built = {};

  it('should return an <exact> filter', () => {
    const filter = filterFactory.get(built, 'name', 'value');
    filter.buildQuery();
    expect(built['where']['name']).toBe('value');
  });

  it('should return a <contains> filter', () => {
    const filter = filterFactory.get(built, 'name__contains', 'value');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(Like('%value%'));
  });

  it('should return an <startswith> contains filter', () => {
    const filter = filterFactory.get(built, 'name__endswith', 'value');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(Like('%value'));
  });

  it('should return an <endswith> filter', () => {
    const filter = filterFactory.get(built, 'name__startswith', 'value');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(Like('value%'));
  });

  it('should return an <isnull> filter', () => {
    const filter = filterFactory.get(built, 'name__isnull', 'value');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(IsNull());
  });

  it('should return an <gt> filter', () => {
    const filter = filterFactory.get(built, 'name__gt', '2');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(MoreThan('2'));
  });

  it('should return a <gte> filter', () => {
    const filter = filterFactory.get(built, 'name__gte', '2');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(MoreThanOrEqual('2'));
  });

  it('should return a <lt> filter', () => {
    const filter = filterFactory.get(built, 'name__lt', '2');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(LessThan('2'));
  });

  it('should return a <lte> filter', () => {
    const filter = filterFactory.get(built, 'name__lte', '2');
    filter.buildQuery();
    expect(built['where']['name']).toEqual(LessThanOrEqual('2'));
  });


});

describe('Test FindOption Builder', () => {

  it('should build a query with an exact & contains filter', () => {
    const queryBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com'
    });
    const build = queryBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%'),
      },
      skip: 0,
      take: 25,
    });
  });

  it('should build a query with skip equals to 0 and take equals to 25', () => {
    const queryBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 1
    });
    const build = queryBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%'),
      },
      skip: 0,
      take: 25,
    });
  });

  it('should build a query with skip equals to 25 and take equals to 25', () => {
    const queryBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 2
    });
    const build = queryBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%'),
      },
      skip: 25,
      take: 25,
    });
  });

  it('should build a query with skip equals to 50 and take equals to 25', () => {
    const queryBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 3
    });
    const build = queryBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%'),
      },
      skip: 50,
      take: 25,
    });
  });

  it('should build a query with skip equals to 20 and take equals to 10', () => {
    const queryBuilder = new FindOptionBuilder({
      name: 'rjlopezdev',
      email__contains: '@gmail.com',
      page: 3,
      limit: 10
    });
    const build = queryBuilder.build();
    expect(build).toEqual({
      where: {
        name: 'rjlopezdev',
        email: Like('%@gmail.com%'),
      },
      skip: 20,
      take: 10,
    });
  });
});
