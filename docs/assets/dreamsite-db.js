(function () {
  var KEY = "dreamsite-wishes-v1";
  var SEED = [{"id":"6f0c1a2e-7b34-4c1a-9d11-0a1b2c3d4e01","title":"PlayStation 5","description":"To play co-op games together on cozy evenings","imageUrl":"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60","category":"games","priority":"medium","owner":"draven","isCompleted":false},{"id":"6f0c1a2e-7b34-4c1a-9d11-0a1b2c3d4e02","title":"Matching Couple Rings","description":"Silver bands with our initials engraved inside","imageUrl":null,"category":"products","priority":"high","owner":"ours","isCompleted":true},{"id":"6f0c1a2e-7b34-4c1a-9d11-0a1b2c3d4e03","title":"Build a Lego Set Together","description":"The big Hogwarts Castle set for weekend project","imageUrl":"https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=60","category":"collections","priority":"high","owner":"ours","isCompleted":false},{"id":"6f0c1a2e-7b34-4c1a-9d11-0a1b2c3d4e04","title":"Start a Garden","description":"Plant flowers and vegetables on our balcony","imageUrl":null,"category":"plans","priority":"high","owner":"ours","isCompleted":false},{"id":"6f0c1a2e-7b34-4c1a-9d11-0a1b2c3d4e05","title":"Stardew Valley Co-op","description":"Build a farm together in the game","imageUrl":null,"category":"games","priority":"low","owner":"clairine","isCompleted":true},{"id":"6f0c1a2e-7b34-4c1a-9d11-0a1b2c3d4e06","title":"Trip to Japan","description":"Visit Tokyo and Kyoto during cherry blossom season","imageUrl":"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=60","category":"travel","priority":"high","owner":"ours","isCompleted":false}];

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    var copy = SEED.map(function (wish) { return Object.assign({}, wish); });
    localStorage.setItem(KEY, JSON.stringify(copy));
    return copy;
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function normalize(data) {
    return {
      title: data.title,
      description: data.description == null ? null : data.description,
      imageUrl: data.imageUrl == null ? null : data.imageUrl,
      category: data.category || "products",
      priority: data.priority || "medium",
      owner: data.owner || "draven",
      isCompleted: Boolean(data.isCompleted),
    };
  }

  function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
      status: status,
      headers: { "Content-Type": "application/json" },
    });
  }

  function pathname(url) {
    var path = url || "";
    try {
      if (/^https?:/i.test(path)) path = new URL(path).pathname;
    } catch (e) {}
    path = path.split("?")[0].split("#")[0];
    if (path.length > 1 && path.charAt(path.length - 1) === "/") path = path.slice(0, -1);
    return path;
  }

  var original = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var method = (
      (init && init.method) ||
      (typeof input !== "string" && input && input.method) ||
      "GET"
    ).toUpperCase();
    var path = pathname(url);
    var marker = "/api/wishes";
    var at = path.indexOf(marker);
    if (at === -1) return original(input, init);

    var wishes = load();
    var rest = path.slice(at + marker.length);

    if (method === "GET" && rest === "") return Promise.resolve(jsonResponse(wishes, 200));

    if (method === "POST" && rest === "") {
      var body = {};
      try { body = JSON.parse((init && init.body) || "{}"); } catch (e) {}
      if (!body.title) return Promise.resolve(jsonResponse({ error: "Invalid wish data" }, 400));
      var created = normalize(body);
      created.id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
      wishes.push(created);
      save(wishes);
      return Promise.resolve(jsonResponse(created, 201));
    }

    if (method === "DELETE" && rest === "/completed/all") {
      var kept = wishes.filter(function (wish) { return !wish.isCompleted; });
      var deleted = wishes.length - kept.length;
      save(kept);
      return Promise.resolve(jsonResponse({ deleted: deleted }, 200));
    }

    var id = rest.charAt(0) === "/" ? decodeURIComponent(rest.slice(1)) : "";
    var index = -1;
    for (var i = 0; i < wishes.length; i++) {
      if (wishes[i].id === id) { index = i; break; }
    }

    if (method === "GET") {
      if (index < 0) return Promise.resolve(jsonResponse({ error: "Wish not found" }, 404));
      return Promise.resolve(jsonResponse(wishes[index], 200));
    }

    if (method === "PATCH") {
      if (index < 0) return Promise.resolve(jsonResponse({ error: "Wish not found" }, 404));
      var updates = {};
      try { updates = JSON.parse((init && init.body) || "{}"); } catch (e) {}
      var next = Object.assign({}, wishes[index]);
      Object.keys(updates).forEach(function (key) {
        if (updates[key] !== undefined) next[key] = updates[key];
      });
      wishes[index] = next;
      save(wishes);
      return Promise.resolve(jsonResponse(next, 200));
    }

    if (method === "DELETE") {
      if (index < 0) return Promise.resolve(jsonResponse({ error: "Wish not found" }, 404));
      wishes.splice(index, 1);
      save(wishes);
      return Promise.resolve(new Response(null, { status: 204 }));
    }

    return Promise.resolve(jsonResponse({ error: "Failed to fetch wishes" }, 500));
  };
})();
