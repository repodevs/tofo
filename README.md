<p align="center">
  Easily transform an url query into TypeORM FindOptions
  <br>
  <br>
  <img src="https://circleci.com/gh/repodevs/tofo/tree/master.svg?style=svg">
  <br>
  <br>
  <a href="https://codecov.io/gh/repodevs/tofo">
  <img src="https://codecov.io/gh/repodevs/tofo/branch/master/graph/badge.svg" />
  </a>
  <img src="https://badge.fury.io/js/tofo.svg">
  <img src="https://img.shields.io/badge/license-MIT-green.svg">
  <br>
  <br>
</p>

# TOFO - TypeORM [FindOptions](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md) Builder
TOFO stand for `T`ype`O`RM `F`ind`O`ptions. this library allows you to transform automatically _url query_ into TypeORM FindOptions queries.

## Installation

`npm install tofo`


## How it works?

![](https://raw.githubusercontent.com/repodevs/tofo/master/tofo-flow.png)


## Usage

* [Quick Start](#quick-start)
* [Using Allowed Fields](#allowed-fields)
* [Using POST method to retrive data](#using-post-method-to-retrieve-data)

### Quick Start

Use `FindOptionBuilder` export from package and pass your `req.query` as an argument.

Given the following url query string:

`foo/?name__contains=foo&role__in=admin,common&age__gte=18&page=3&limit=10`

Then build the query into FindOptions
```typescript
import { FindOptionBuilder } from 'tofo';

const builder = new FindOptionBuilder(req.query);
const builtQuery = builder.build();
```

It will be transformed into:

```typescript
{
  where: {
    foo: Like('%foo%'),
    role: In(['admin', 'common']),
    age: MoreThanOrEqual(18)
  },
  skip: 20,
  take: 10
}
```

Now your query is builted, pass it to your TypeORM repository.

```typescript
const results = await fooRepository.find(builtQuery);
```

For another available syntax can be found in [here](#available-lookups):

### Allowed Fields

By default, `tofo` accepting all fields passed in `req.query`. If you need to filtering for only some fields you can use `setAllowedFields()` function.

```typescript
// Let's say this query got from req.query
const query = { name: "foo", status: "active", location: "Sukowati", limit: 5 };

const builder = new FindOptionBuilder(query);
// Set allowed fields
builder.setAllowedFields(['limit']);
builder.setAllowedFields(['name', 'status']);

// Build query
const builtQuery = builder.build();
```

It will be transformed into:

```typescript
{
  skip: 0,
  take: 5,
  where: {
    name: 'foo',
    status: 'active'
  },
}
```

> WARNING: you also need to set allowed [builtin query options keys](#query-option-keys) if needed, otherwise the keys will be removed before build.

### Using POST method to retrieve data

Instead using `req.query` from GET method, you also can send data using POST method and retrieve the data from `req.body`.

```bash
curl --location --request POST 'http://localhost/api/foo' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "foo",
    "status": "active"
}'
```

And handle data like

```javascript
app.post('/api/foo', (req, res) => {
  const builder = new FindOptionBuilder(req.body); // => Process data from req.body
  const builtQuery = builder.build();
})
```

## Available Lookups

| Lookup | Behaviour | Example |
| --- | --- | --- |
_(none)_ | Return entries that match with value | `foo=raul`
__contains__ | Return entries that contains value | `foo__contains=lopez`
__startswith__ | Return entries that starts with value | `foo__startswith=r`
__endswith__ | Return entries that ends with value | `foo__endswith=dev`
__isnull__ | Return entries with null value | `foo__isnull`
__lt__ | Return entries with value less than or equal to provided | `foo__lt=18`
__lte__ | Return entries with value less than provided | `foo__lte=18`
__gt__ | Returns entries with value greater than provided | `foo__gt=18`
__gte__ | Return entries with value greater than or equal to provided | `foo__gte=18`
__in__ | Return entries that match with values in list | `foo__in=admin,common`
__between__ | Return entries in range | `foo__between=1,27`

### Notice

You can use negative logic prefixing lookup with `__not`. *Example:* `foo__not__contains=value`

Querying a column from an embedded entity. *Example*: `user.name=value`

## OR condition union
```typescript
// ?$or=name:juste|age__gte:15&$or=user.role:admin
{
  where: [
    { name: 'juste', age: MoreThanOrEqual('15') },
    { user: { role: 'admin' } }
  ]
}

// ?city=Dahomey&$or=name:juste|age__gte:15&$or=user.role:admin
{
  where: [
    { name: 'juste', city: 'Dahomey', age: MoreThanOrEqual('15') },
    { user: { role: 'admin' }, city: 'Dahomey' }
  ]
}
```
## Query Option Keys

| Option | Default | Behaviour | Example |
| --- | :---: | --- | --- |
pagination | __true__ | If _true_, paginate results. If _false_, disable pagination | `pagination=false`
page | __1__ | Return entries for page `page` | `page=2`
limit | __25__ | Return entries for page `page` paginated by size `limit` | `limit=15`
order | - | Order for fields:<br>`^`: Ascendant <br> `-`: Descendant | `order=^foo,-name,^surname`
join | - | Set relations | `join=posts,comments`
select | - | Set fields selection | `select=name,phoneNumber`

> NOTE: If you using `AllowedFields` you also need to include these option keys also.

---

## Available Methods

### Remove precautionary fields from the query before building
```typescript
removeField(field: string): FindOptionBuilder
```

### Set Allowed Fields from the query before building
```typescript
setAllowedFields(['allowed_field1', 'allowed_field2']): FindOptionBuilder
```

---

## Others

You can use the <a href="https://github.com/justkey007/typeorm-front-query-builder">frontend query builder</a> to go faster without having to worry too much about the syntax.
