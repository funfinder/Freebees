describe("this testing suite", function() {
  it ("should show that true is true", function() {
    expect(true).toEqual(true);
  })
  it ("should show that false is not true", function() {
    expect(false).not.toBe(true);
  })
});

describe("format date function", function() {
  it ("should be a function", function() {
    expect(typeof formatDate).toEqual('function');
  })
  it ("should returned formatted date", function() {
    expect(formatDate()).toContain("/");
  })
});

