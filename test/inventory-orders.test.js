var test = require('node:test');
var assert = require('node:assert/strict');

var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

function makeDb() {
  return {
    nextOrderId: 1,
    products: [{ id: 10, name: 'Test item', stock: 3, reserved: 1 }],
    orders: [],
    customers: []
  };
}

test('inventory.check permits an order for exactly the last sellable unit', function () {
  var products = [{ id: 10, name: 'Test item', stock: 3, reserved: 1 }];

  var result = inventory.check(products, [{ id: 10, qty: 2 }]);

  assert.deepEqual(result, { ok: true });
});

test('cancelling an order with id line items restores physical stock', function () {
  var db = makeDb();
  var items = [{ id: 10, qty: 1 }];

  inventory.reserve(db.products, items);
  var order = orders.add(db, {
    items: items,
    paymentMode: 'cash',
    subtotal: 10,
    discount: 0,
    tax: 0,
    total: 10
  });
  var result = orders.cancel(db, order.id, 'characterization test');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(db.products[0].stock, 3);
  assert.equal(db.products[0].reserved, 1);
});
