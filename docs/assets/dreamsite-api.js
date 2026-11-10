(function () {
  var API = "https://br-long-waterfall-a1rkzc32-wishes.compute.c-1.ap-southeast-1.aws.neon.tech";
  var original = window.fetch.bind(window);

  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var path = url;
    var search = "";
    try {
      if (/^https?:/i.test(url)) {
        var parsed = new URL(url);
        path = parsed.pathname;
        search = parsed.search;
      }
    } catch (e) {}
    path = path.split("#")[0];
    if (path.length > 1 && path.charAt(path.length - 1) === "/") path = path.slice(0, -1);
    if (path.indexOf("/api/wishes") === -1) return original(input, init);

    var rest = path.slice(path.indexOf("/api/wishes"));
    var next = Object.assign({}, init || {}, { credentials: "omit" });
    return original(API + rest + search, next);
  };
})();
