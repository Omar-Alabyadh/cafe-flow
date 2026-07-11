import test from "node:test";

// F1 deliberately does not inspect DATABASE_URL to decide whether the configured
// database is isolated. These cases become executable when CI provides a disposable
// PostgreSQL database created solely for this test suite.
test.skip("database: pending and failed attempts may coexist for one order", () => {});
test.skip("database: only one captured payment may exist for one order", () => {});
test.skip("database: order numbers are unique within a business", () => {});
test.skip("database: the same order number may exist in different businesses", () => {});
test.skip("database: receipt numbers are unique within a business", () => {});
test.skip("database: legacy nullable order, item, and payment fields remain valid", () => {});
test.skip("database: document sequence is unique by business and document type", () => {});
test.skip("database: concurrent sequence allocation is unique and continuous", () => {});
test.skip("database: a rolled-back document transaction does not consume a sequence value", () => {});
