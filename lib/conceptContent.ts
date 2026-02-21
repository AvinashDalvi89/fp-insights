export interface ConceptContent {
  id: string;
  plain: string;
  analogy: string;
  youKnowThis: string[];
  applyWhen: string[];
  code: {
    label: string;
    snippet: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    passFeedback: string;
    failFeedback: string;
  };
}

export const CONCEPT_CONTENT: ConceptContent[] = [
  {
    id: 'referential-transparency',
    plain: `A function is referentially transparent if you can replace any call to it with its return value — and the program behaves exactly the same. It means the function has no hidden behavior: no reading from globals, no writing to databases, no randomness, no time-dependency. What goes in determines what comes out, always.`,
    analogy: `Think of a calculator. You press 3 × 4 and always get 12. You can replace the expression "3 × 4" with 12 anywhere in your math homework and nothing changes. But a vending machine is not referentially transparent — pressing the button twice might return different results depending on stock, payment state, and timing.`,
    youKnowThis: [
      'Math.max(3, 5) → always 5',
      'String.slice(), Array.map() — same input, same output',
      'Pure utility functions you already write (formatters, validators)',
      'SQL expressions like UPPER("hello") → always "HELLO"',
    ],
    applyWhen: [
      'Writing utility functions (formatters, validators, calculators) — make them RT so they\'re trivially testable',
      'Refactoring: if a function is RT, you can safely inline it, extract it, or call it any number of times',
      'When debugging: RT functions eliminate themselves as suspects — the bug must be elsewhere',
      'In critical business logic (pricing, billing, scoring) — RT means no surprises in production',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// NOT referentially transparent — result changes each call
let count = 0;
function nextId() {
  return ++count; // depends on external mutable state
}
nextId(); // → 1
nextId(); // → 2  (different result, same call!)

// NOT referentially transparent — depends on time
function greet() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : 'Good afternoon';
}

// REFERENTIALLY TRANSPARENT — same input, same output, always
function add(a, b) {
  return a + b; // no side effects, no external state
}
add(3, 4); // → 7, today, tomorrow, in any order, forever

function formatPrice(cents) {
  return '$' + (cents / 100).toFixed(2);
}
formatPrice(1099); // → '$10.99', always`,
    },
    quiz: {
      question: 'Which of these functions is referentially transparent?',
      options: [
        'function getTime() { return Date.now(); }',
        'function double(n) { return n * 2; }',
        'function save(user) { db.save(user); return user; }',
        'function log(msg) { console.log(msg); return msg; }',
      ],
      correctIndex: 1,
      passFeedback:
        'Correct! double(5) always returns 10. You can replace any call to double(5) with 10 anywhere in your code — nothing changes. No surprises, no hidden state.',
      failFeedback:
        'double(n) is the answer. getTime() changes with time, save() writes to a database (side effect), log() writes to console (side effect). double(n) just computes — same input always gives same output.',
    },
  },

  {
    id: 'pure-core',
    plain: `Separate your business logic from your side effects. Keep the logic — calculations, decisions, transformations — in pure functions that take inputs and return outputs with no database or network calls. Push all the I/O to the outer edge of your system. The result: you can test 90% of your code with zero mocks, zero test infrastructure.`,
    analogy: `A chef vs. a waiter. The chef (pure core) just cooks: given ingredients, produces food. The waiter (thin shell) handles the messy outside world: taking orders, running cards, dealing with complaints. You can test the chef's recipes in a kitchen lab without any customers. The waiter's job is thin enough that you can trust it with minimal testing.`,
    youKnowThis: [
      'A function that calculates a discount — no DB calls, just numbers in/out',
      'Redux reducers: (state, action) => newState — pure core state machines',
      'SQL: the query is logic; the database engine is the shell that executes it',
      'Domain-driven design: the domain model is the pure core',
    ],
    applyWhen: [
      'Before writing any function: ask "does this need to touch the database/network/filesystem?" If no — keep it pure',
      'When you find yourself writing mocks in tests: the function you\'re testing is probably doing too much — extract the pure logic',
      'Complex business rules (pricing, eligibility, calculations) should always be pure — they\'re the most important to test',
      'When onboarding new devs: pure core functions are self-documenting — they show what the system does, not how it talks to the world',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// THIN SHELL — handles I/O at the edge, nothing else
async function processOrder(userId, cartId, promoCode) {
  // Step 1: get data (side effect)
  const cart = await db.getCart(cartId);
  const user = await db.getUser(userId);

  // Step 2: pure core — all the business logic
  const total = calculateOrderTotal(cart.items, promoCode);
  const discount = getDiscount(user.tier, total);
  const finalTotal = total - discount;

  // Step 3: save results (side effect)
  await db.saveOrder({ userId, total: finalTotal });
  return finalTotal;
}

// PURE CORE — testable with zero infrastructure
function calculateOrderTotal(items, promoCode) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const promo = promoCode === 'SAVE10' ? 0.10 : 0;
  return subtotal * (1 - promo);
}

function getDiscount(userTier, amount) {
  if (userTier === 'gold' && amount > 100) return amount * 0.05;
  return 0;
}

// Tests need zero mocks, zero DB setup:
assert(calculateOrderTotal([{price:50,qty:2}], 'SAVE10') === 90);
assert(getDiscount('gold', 200) === 10);`,
    },
    quiz: {
      question:
        'You\'re writing a function that calculates shipping cost based on weight, destination, and carrier rates. Where should this logic live?',
      options: [
        'In the same async function that calls the shipping carrier\'s API',
        'As a pure function: (weight, destination, rates) => price, with no I/O',
        'As a method on the Order class that reads rates from a config file',
        "It doesn't matter as long as it works",
      ],
      correctIndex: 1,
      passFeedback:
        'Exactly! Shipping cost calculation is pure logic — numbers in, number out. No network call needed to compute it. Keep the carrier API call in the thin shell; keep the calculation in the pure core.',
      failFeedback:
        'Option B is the pure core pattern. The calculation (weight + rates → cost) is pure logic. The API call to get rates is a side effect. Separate them: fetch rates in the shell, compute cost in a pure function. This makes the calculation trivially testable.',
    },
  },

  {
    id: 'errors-as-values',
    plain: `Instead of throwing exceptions, return a value that explicitly represents either success or failure. The caller receives both possibilities and must handle them — they can't accidentally ignore an error. This makes error handling visible in the code structure, composable with other operations, and impossible to skip.`,
    analogy: `An ATM doesn't throw an exception and crash when your balance is too low. It returns a result: "approved" or "insufficient funds." The machine shows you the outcome and lets you decide what to do. Errors as values work the same way — failure is just another return value, not a system disruption.`,
    youKnowThis: [
      'Go: func getUser() (User, error) — always returns both; caller must check error',
      'Rust: Result<T, E> — the type system forces you to handle both cases',
      "JavaScript fetch(): returns a rejected Promise — you handle it in .catch()",
      'Optional chaining: user?.address?.city — returns undefined on failure, not a crash',
    ],
    applyWhen: [
      'Parsing user input (JSON, dates, numbers) — parsing can legitimately fail, make that visible',
      'Network/database calls — anything that talks to the outside world can fail',
      'File I/O — file might not exist, permissions might be wrong',
      'When you\'re writing try/catch everywhere: that\'s a sign errors should be values instead',
      'API boundaries — callers of your library should see possible failures in the return type',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// THROWING — caller has no idea this can fail
function parseAge(str) {
  const n = parseInt(str);
  if (isNaN(n)) throw new Error('Not a number'); // invisible!
  return n;
}
// Easy to forget: const age = parseAge(input); // might crash!

// RETURNING ERROR — caller MUST handle both paths
function parseAge(str) {
  const n = parseInt(str);
  if (isNaN(n)) return { ok: false, error: 'Not a number' };
  if (n < 0 || n > 150) return { ok: false, error: 'Out of range' };
  return { ok: true, value: n };
}

const result = parseAge(userInput);
if (result.ok) {
  console.log('Age is:', result.value);
} else {
  showError(result.error); // forced to handle it
}

// CHAINING errors as values (Railway-style)
const pipeline =
  parseAge(input)                          // {ok, value/error}
    .flatMap(age => validateRange(age))    // only runs if ok
    .flatMap(age => saveToProfile(age));   // only runs if ok
// If any step fails, the rest are skipped automatically`,
    },
    quiz: {
      question:
        "Your function reads a config file. If the file doesn't exist, what's the best approach?",
      options: [
        'Throw an exception: throw new Error("File not found")',
        'Return null and let the caller deal with it',
        'Return { ok: false, error: "File not found" } or a Result type',
        'Log the error and silently return a default config',
      ],
      correctIndex: 2,
      passFeedback:
        'Right! A result type forces callers to explicitly handle the failure case. null is dangerous (null pointer errors), exceptions are invisible (easy to forget to catch), silent defaults hide bugs.',
      failFeedback:
        "C is best practice. Returning a result type makes failure visible in the function's signature — callers can't miss it. null leads to null pointer crashes, exceptions are invisible, silent defaults hide bugs that should surface. Make failure explicit.",
    },
  },

  {
    id: 'laziness',
    plain: `Laziness means: don't compute a value until it's actually needed. Instead of processing everything upfront, you describe what to do and compute on demand. This lets you work with infinite sequences without running out of memory, and it lets multiple operations (map, filter, take) fuse into a single pass over the data.`,
    analogy: `A recipe book vs. actually cooking. A recipe can say "all even squares from 1 to infinity." No memory is used until you ask for the first result. Compare to making all the food first and then throwing away what you don't need. Lazy evaluation is the recipe — you cook only what you serve.`,
    youKnowThis: [
      'Python generators: yield produces one value at a time, on demand',
      'JavaScript async iterators: for await (const x of stream) — one chunk at a time',
      'SQL query builders (Knex, Arel): build a query object, execute only when you call .fetch()',
      'React Suspense: component describes loading state, React decides when to render',
      'RxJS Observables: describe a stream of events, only active when subscribed',
    ],
    applyWhen: [
      'Processing large files or datasets — read and process one record at a time, not all at once',
      'Infinite sequences — pagination, event streams, sensor data feeds',
      'Chaining multiple map/filter/take — lazy fusion avoids creating intermediate arrays',
      'Expensive computations that might not be needed — compute only if the value is actually used',
      'Pipeline stages — describe the full pipeline before deciding how much to run',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// EAGER — processes ALL 10 million items immediately
const result = bigArray
  .map(x => x * 2)       // creates 10M-item array in memory
  .filter(x => x > 10)   // creates another large array
  .slice(0, 3);           // finally takes just 3 items
// Wasted: processed 9,999,997 items we didn't need

// LAZY (generator) — processes only what you need
function* lazyPipeline(data) {
  for (const x of data) {
    const doubled = x * 2;
    if (doubled > 10) yield doubled; // produce one value
  }
}

const gen = lazyPipeline(bigArray);
const first = gen.next().value; // processed until first match
const second = gen.next().value; // processed until second match
const third = gen.next().value;  // stopped after 3 total
// Processed only as many items as needed!

// INFINITE sequence — impossible with eager, trivial with lazy
function* naturals() {
  let n = 1;
  while (true) yield n++; // "all natural numbers"
}

function* take(n, iter) {
  for (const x of iter) {
    if (n-- <= 0) return;
    yield x;
  }
}

const first10 = [...take(10, naturals())]; // [1,2,3,...,10]`,
    },
    quiz: {
      question:
        'You need to find the first 5 users whose last login was over a year ago from a database with 10 million rows. Which approach is best?',
      options: [
        'Fetch all 10 million rows into memory, filter, then take 5',
        'Use a lazy cursor / streaming query that fetches rows one by one and stops after 5 matches',
        'Run a COUNT query first to know the total, then fetch',
        'Use a recursive function to page through results',
      ],
      correctIndex: 1,
      passFeedback:
        'Exactly right! A lazy streaming query reads rows one at a time and stops the moment it finds 5 matches. You might only read 20 rows to find 5 stale users — not 10 million.',
      failFeedback:
        'B is correct. A lazy/streaming approach reads and processes rows on demand, stopping as soon as the condition is satisfied. Loading all 10 million rows (A) wastes enormous memory and time. Lazy evaluation is the key pattern for large data sets.',
    },
  },

  {
    id: 'functional-state',
    plain: `Instead of modifying a variable in place, write a function that takes the current state and returns the new state. State becomes just data — a plain value. Transitions become just functions — pure, testable, replayable. You never mutate; you always produce a new version.`,
    analogy: `Git commits. Git doesn't modify files in place — each commit creates a new snapshot of the entire repository. You can go back to any previous state, see exactly what changed and when, and even replay history. Functional state works the same way: every transition is a new "commit" of your state.`,
    youKnowThis: [
      'React useState: you call setState(newValue), you never do state.value = x',
      'Redux reducers: (state, action) => newState — literally functional state',
      'React useReducer: the same pattern, built into React',
      'Immutable.js / Immer: libraries that enforce functional state updates',
      'Event sourcing: store all state transitions as events, rebuild state by replaying them',
    ],
    applyWhen: [
      'Any state that changes over time: counters, shopping carts, game state, form state',
      'State machines: model each state as a value and each transition as a pure function',
      'When debugging state bugs: pure state transitions let you log every state and replay exactly',
      'Complex update logic (useReducer pattern): extract state transitions to pure functions, test them in isolation',
      'Undo/redo features: keep a history of state values, each one is a snapshot',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// MUTABLE STATE — hard to test, debug, or replay
class Counter {
  count = 0;
  increment() { this.count++; }           // modifies in place
  add(n)      { this.count += n; }        // side effect
  reset()     { this.count = 0; }
}
// To test: create Counter, call methods, check .count
// Can't easily replay, can't snapshot, can't run in parallel

// FUNCTIONAL STATE — state is just a value
const initialState = { count: 0, history: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'ADD':
      return { ...state, count: state.count + action.n };
    case 'RESET':
      return { ...state, count: 0 };
    default:
      return state;
  }
}

// Pure functions: trivially testable with no setup
const s0 = initialState;                          // {count:0}
const s1 = reducer(s0, { type: 'INCREMENT' });    // {count:1}
const s2 = reducer(s1, { type: 'ADD', n: 5 });   // {count:6}
const s3 = reducer(s2, { type: 'RESET' });        // {count:0}

// This is literally what React's useReducer does:
// const [state, dispatch] = useReducer(reducer, initialState);`,
    },
    quiz: {
      question:
        "In React, why does useState return [value, setter] instead of giving you a mutable object you can modify directly?",
      options: [
        "It's a technical limitation — JavaScript objects can't be watched",
        'State should be immutable: you produce new state instead of mutating old state (core FP principle)',
        "React needs to know when state changes to schedule re-renders",
        'Both B and C — immutable state is both the FP principle and how React tracks changes',
      ],
      correctIndex: 3,
      passFeedback:
        "Both! React uses the setter to know when to re-render (practical reason), and the pattern is grounded in FP: state is a value, transitions produce new values. useReducer makes this pattern even more explicit.",
      failFeedback:
        "D — both B and C. React enforces immutable updates so it can detect changes and schedule re-renders (C). And the design is fundamentally FP: state is a plain value, transitions are functions that return new values (B). useReducer makes the pattern completely explicit.",
    },
  },

  {
    id: 'property-testing',
    plain: `Instead of writing specific test cases ("given input X, expect output Y"), you describe properties — invariants that must hold for any input. A framework then generates hundreds of random inputs and tries to find one that breaks your property. You're describing what should always be true, not what happens in one example.`,
    analogy: `Instead of testing "does my sort work on [3,1,2]?", you say: "for any array, sorting should always produce an ordered result with the same elements as the input." The computer runs this rule against 10,000 randomly generated arrays — including edge cases you'd never think to write: empty arrays, duplicates, negatives, huge numbers.`,
    youKnowThis: [
      'Hypothesis (Python): @given(st.lists(st.integers())) def test_sort(lst): ...',
      'fast-check (JavaScript): fc.assert(fc.property(fc.array(fc.integer()), arr => ...))',
      'QuickCheck (Haskell): the original, invented the technique',
      "QA's stress/fuzz testing: property tests automate exactly what QA does manually",
      'Spec-by-example in BDD: properties are the "rules" behind the examples',
    ],
    applyWhen: [
      'Parsers & serializers: encode(decode(x)) === x should hold for any x (round-trip property)',
      'Sorting & ordering: result is ordered, has same elements, same length',
      'Mathematical operations: commutativity (a+b === b+a), associativity ((a+b)+c === a+(b+c))',
      'Compression: decompress(compress(x)) === x',
      'Any invariant that should hold universally — "the output always satisfies condition Y"',
    ],
    code: {
      label: 'JavaScript (fast-check)',
      snippet: `import fc from 'fast-check';

// EXAMPLE-BASED TESTS (traditional)
test('sort [3,1,2]', () => {
  expect(mySort([3,1,2])).toEqual([1,2,3]);  // only tests this one case
});

// PROPERTY-BASED: describes rules, runs 1000s of random cases
test('sort: result is always ordered', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const sorted = mySort([...arr]);
      // Property 1: adjacent elements are ordered
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] < sorted[i-1]) return false;
      }
      return true;
    }
  ));
});

test('sort: same elements, same count', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const sorted = mySort([...arr]);
      // Property 2: sorting doesn't add or remove elements
      return sorted.length === arr.length &&
        [...arr].sort().join() === sorted.join();
    }
  ));
});

// Classic: serialize/deserialize round-trip
test('JSON round-trip', () => {
  fc.assert(fc.property(
    fc.jsonValue(),
    (data) => JSON.parse(JSON.stringify(data)) === data
  ));
});`,
    },
    quiz: {
      question:
        'You have a serialize(data) and deserialize(string) pair. What is the most powerful property-based test for this?',
      options: [
        "Test that serialize({name:'Alice'}) returns a specific string",
        'Test that deserialize(serialize(data)) equals the original data, for any data input',
        'Test that both functions handle null and undefined correctly',
        'Test performance with a 1MB input',
      ],
      correctIndex: 1,
      passFeedback:
        "Perfect! This 'round-trip' property is one of the most powerful in property testing. It verifies the fundamental contract: serialize and deserialize are inverses of each other. Running it on thousands of random inputs catches edge cases you'd never write manually.",
      failFeedback:
        "B is the key insight. Round-trip properties (serialize → deserialize = identity) express the fundamental contract and work for any input. This one property, run against thousands of random inputs, catches far more bugs than hundreds of hand-crafted test cases.",
    },
  },

  {
    id: 'monoids',
    plain: `A monoid is any operation that is associative (grouping doesn't matter: (a+b)+c = a+(b+c)) and has an identity element (a neutral value: 0 for addition, "" for string concat). Because grouping doesn't matter, you can split work across any number of machines, process in parallel, and combine results — guaranteed same answer.`,
    analogy: `Addition. 1+2+3+4+5 = (1+2)+(3+4+5) = (1+2+3)+(4+5) = same answer no matter how you group it. Split the sum across 100 machines, each sums its portion, you add the totals. MapReduce, Spark, and Hadoop all exploit this exact property. Monoids are why big data pipelines can scale horizontally.`,
    youKnowThis: [
      'SQL COUNT(*), SUM(amount) — associative, so the database can compute them in parallel',
      'String concatenation: "a" + "b" + "c" = ("a"+"b")+"c" = "a"+("b"+"c")',
      'Array concat: [...a, ...b, ...c] — grouping doesn\'t matter',
      'Set union: A ∪ B ∪ C — can be split and combined freely',
      'React state merges: setState({...prev, x}) — building up state incrementally',
    ],
    applyWhen: [
      'Aggregating data across shards, machines, or time windows — if your operation is a monoid, it parallelizes for free',
      'Incremental computation: process new data incrementally and merge with existing results',
      'Combining multiple validation results, multiple error lists, multiple log entries',
      'Any "combine two things of the same type to get the same type" operation',
      'MapReduce pipelines: the "reduce" step is always a monoid',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// A monoid needs: combine(a, b) and an identity value
const addMonoid = {
  combine: (a, b) => a + b,
  identity: 0,  // 0 + x = x = x + 0
};

const concatMonoid = {
  combine: (a, b) => a + b,     // string concat
  identity: '',                  // '' + s = s
};

const maxMonoid = {
  combine: (a, b) => Math.max(a, b),
  identity: -Infinity,           // max(-Inf, x) = x
};

// Because it's associative, you can split and parallelize:
const data = [1, 2, 3, 4, 5, 6, 7, 8];

// Sequential (single machine):
const seq = data.reduce(addMonoid.combine, addMonoid.identity); // 36

// Parallel (4 machines, then combine):
const m1 = [1,2].reduce(addMonoid.combine, 0);   // 3
const m2 = [3,4].reduce(addMonoid.combine, 0);   // 7
const m3 = [5,6].reduce(addMonoid.combine, 0);   // 11
const m4 = [7,8].reduce(addMonoid.combine, 0);   // 15

const total = [m1,m2,m3,m4].reduce(addMonoid.combine, 0); // 36
// Same answer! This is why MapReduce works.`,
    },
    quiz: {
      question:
        'Your analytics pipeline counts events across 100 database shards. Why can each shard safely count its own events and then you sum the shard totals?',
      options: [
        'Because counting is a simple operation that always works',
        'Because addition is a monoid: it is associative and has an identity element (0)',
        'Because the shards are synchronized with each other',
        'Because integer overflow is not a concern here',
      ],
      correctIndex: 1,
      passFeedback:
        "Exactly! Addition's associativity means (shard1 + shard2) + shard3 = shard1 + (shard2 + shard3). The identity (0) lets you start each shard with an empty accumulator. This mathematical property is why any map-reduce style computation can scale horizontally.",
      failFeedback:
        "B is the mathematical reason. Associativity means grouping doesn't change the result — you can split the computation any way you want and combine partial results. The identity (0) means each shard starts clean. This is why SQL's COUNT and SUM can be computed in parallel across shards, nodes, and time windows.",
    },
  },

  {
    id: 'monad-pattern',
    plain: `A monad is a pattern for chaining operations where each step might change the "context" — it might fail, be asynchronous, produce multiple results, etc. The key behavior: if any step in the chain fails or produces None, the remaining steps are skipped automatically. You write each step independently; the pattern handles the routing.`,
    analogy: `A conveyor belt with an automatic ejection system. Each station does one job. If any station detects a problem, the item is ejected and bypasses all remaining stations. You write each station's logic independently — you don't add "if previous station failed, skip me" to every station. The belt handles that.`,
    youKnowThis: [
      'JavaScript Promises: .then() is flatMap. Rejection short-circuits the chain to .catch()',
      'async/await: just syntactic sugar for Promise chaining — same monad, nicer syntax',
      "Optional chaining: user?.address?.city — returns undefined on first null, skips the rest",
      'Array.flatMap(): maps and flattens — flatMap is the core monadic operation',
      'Go error handling pattern: if err != nil { return err } repeated — this is what monads automate',
    ],
    applyWhen: [
      'Chaining operations that can fail: fetchUser → fetchProfile → fetchPosts — each step can fail',
      'Sequences of async operations where each step depends on the previous',
      'Multi-step validation where you want to stop at the first error (fail-fast)',
      'Database transactions: a series of writes where any failure should abort the whole sequence',
      'Any time you write "if (result != null && result.success) { ... next step ... }" — that\'s a monad waiting to happen',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// WITHOUT monadic chaining — manual null/error checks at every step
async function getUserInvoice(userId) {
  const user = await fetchUser(userId);
  if (!user) return null;  // manual check

  const orders = await fetchOrders(user.id);
  if (!orders || orders.length === 0) return null;  // manual check

  const invoice = await generateInvoice(orders);
  if (!invoice) return null;  // manual check

  return invoice;
}

// WITH monadic chaining (Promise IS a monad)
// .then() only runs if the previous step succeeded
// .catch() handles ANY failure in the entire chain
async function getUserInvoice(userId) {
  return fetchUser(userId)
    .then(user => fetchOrders(user.id))      // skipped if user null
    .then(orders => generateInvoice(orders)) // skipped if orders null
    .catch(err => ({ error: err.message })); // handles any step's failure
}

// Result/Option monad — same pattern, explicit types
function findUser(id)    { return id > 0 ? Some(users[id]) : None; }
function findAddress(u)  { return u.addressId ? Some(addrs[u.addressId]) : None; }
function formatCity(a)   { return Some(a.city.toUpperCase()); }

// flatMap chains — None from any step skips the rest
const city = findUser(42)
  .flatMap(user    => findAddress(user))
  .flatMap(address => formatCity(address));
// city is Some("NEW YORK") or None — never a crash`,
    },
    quiz: {
      question:
        "You have: fetchUser(id).then(u => fetchProfile(u.id)).then(p => fetchPosts(p.blogId)). What happens if fetchUser resolves with null (user not found)?",
      options: [
        "fetchProfile receives null and crashes: 'Cannot read property id of null'",
        'The chain pauses and waits for the user to be created',
        'With a proper Option/Maybe monad, the chain short-circuits and fetchProfile/fetchPosts never run',
        'JavaScript automatically converts null to an empty object',
      ],
      correctIndex: 2,
      passFeedback:
        "Correct! With a raw Promise this actually crashes (option A). But with an Option/Result monad returning None instead of null, the flatMap chain short-circuits — subsequent steps are skipped, and you get None/failure at the end. No null checks, no crashes.",
      failFeedback:
        "C describes the goal. With raw Promises and null, option A happens (crash). The monad pattern — using an Option type that returns None instead of null — makes the chain automatically skip subsequent steps. This is why the monad pattern exists: write each step independently, the chain handles failure routing.",
    },
  },

  {
    id: 'applicative',
    plain: `Monads chain sequential steps where each step may depend on the previous result. Applicatives combine independent operations — operations that don't depend on each other's results. The key difference: Applicative can run things in parallel and collect ALL results (including ALL errors); Monad runs things sequentially and short-circuits on first failure.`,
    analogy: `Making breakfast. Toasting bread and boiling eggs are independent — you do both simultaneously (Applicative). But frying an egg in the toast drippings requires the toast to finish first — that's a dependency (Monad). Using a Monad when operations are independent wastes time. Using Applicative when there are real dependencies produces incorrect results.`,
    youKnowThis: [
      'Promise.all([fetchUser, fetchSettings, fetchPermissions]) — independent, run in parallel, collect all results. That\'s Applicative.',
      'fetchUser().then(user => fetchOrdersFor(user.id)) — sequential, result depends on previous. That\'s Monad.',
      'Form validation: checking all fields independently, showing all errors at once — Applicative.',
      'Multi-API fan-out: calling 3 independent services and combining their results — Applicative.',
    ],
    applyWhen: [
      'Form validation: collect ALL errors at once so users see everything in one submission (Applicative)',
      'Fetching independent data: user profile + settings + permissions — fetch all in parallel (Applicative)',
      'Step 2 depends on step 1\'s value: fetchUser then fetchOrdersFor(user.id) — sequential (Monad)',
      'Rule: if you can write the steps in any order without changing correctness, use Applicative. If order matters, use Monad.',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// MONAD validation — sequential, fail-fast, stops at first error
function validateUserMonad(data) {
  const name = validateName(data.name);
  if (!name.ok) return { ok: false, errors: [name.error] };
  // email check never runs if name fails!
  const email = validateEmail(data.email);
  if (!email.ok) return { ok: false, errors: [email.error] };
  const age = validateAge(data.age);
  if (!age.ok) return { ok: false, errors: [age.error] };
  return { ok: true, user: { name: name.value, email: email.value, age: age.value } };
}
// User gets: "Name is required" → fixes it → submits again
// Gets: "Email is invalid" → fixes it → submits again  ← bad UX

// APPLICATIVE validation — parallel, collect ALL errors
function validateUserApplicative(data) {
  const results = [
    validateName(data.name),
    validateEmail(data.email),
    validateAge(data.age),
  ];
  const errors = results
    .filter(r => !r.ok)
    .map(r => r.error);
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, user: {
    name: results[0].value,
    email: results[1].value,
    age: results[2].value,
  }};
}
// User gets ALL 3 errors at once → fixes everything → submits once ← good UX

// Independent API calls — Applicative (parallel)
const [user, settings, perms] = await Promise.all([
  fetchUser(id),        // independent
  fetchSettings(id),    // independent
  fetchPermissions(id), // independent
]);`,
    },
    quiz: {
      question:
        'You are validating a signup form with 5 fields. The user submits with 3 fields invalid. Which approach gives better user experience?',
      options: [
        'Monad: validate fields in sequence, stop and show the first error found',
        'Applicative: validate all fields independently, show all 3 errors at once',
        'Both produce identical results for validation',
        'Throw an exception for the first invalid field',
      ],
      correctIndex: 1,
      passFeedback:
        "Exactly! Applicative validation collects ALL errors because validations are independent — field A's validity doesn't depend on field B's value. Showing all errors at once is objectively better UX: the user fixes everything in one round.",
      failFeedback:
        "B is correct. When validations are independent (checking name doesn't depend on the email value), use Applicative to collect all errors. Monad stop-at-first-error is right when step 2 genuinely depends on step 1's result. For form validation, steps are independent — use Applicative.",
    },
  },

  {
    id: 'description-execution',
    plain: `Separate "what to do" from "when and how to do it." Build a description of a computation as a pure value — a recipe, a query, a plan. Then execute it at the very edge of your system. The description is pure, testable, and inspectable. The execution happens once at the end, in one controlled place.`,
    analogy: `A SQL query. Writing SELECT * FROM users WHERE age > 30 doesn't fetch any data — it builds a description of what you want. The database executes it when you call .execute(). You can inspect the query, transform it, log it, and test it without touching the database. Execution is separate from description.`,
    youKnowThis: [
      "React JSX: <Button onClick={...}>Click me</Button> is a description of UI, not the DOM itself. React executes it.",
      'SQL query builders (Knex, ActiveRecord): build a query object, execute with .fetch() or .run()',
      'GraphQL: the query string is a description; the resolver runs it',
      'Webpack/Vite config: you describe build steps; the build tool executes them',
      'Docker Compose / Kubernetes YAML: descriptions of infra; the runtime executes them',
    ],
    applyWhen: [
      'Testing IO-heavy logic: build and test the description (pure, no I/O needed); execute separately in production',
      'Building query/request objects: SQL builders, HTTP request builders — describe first, execute when ready',
      'Streaming pipelines: describe the full transformation; execute lazily as data arrives',
      'Configuration-driven systems: represent behavior as data (a description), interpret/execute at runtime',
      'When you want to intercept, transform, or log operations: easier when they\'re values you can inspect',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// EXECUTION-FIRST (bad) — side effects happen immediately
async function loadDashboard(userId) {
  const user    = await fetch('/api/users/' + userId);   // immediate I/O
  const posts   = await fetch('/api/posts?user=' + userId);
  const metrics = await fetch('/api/metrics/' + userId);
  return { user, posts, metrics };
}
// Untestable without mocking fetch. Side effects are everywhere.

// DESCRIPTION-FIRST (good) — build a plan, execute separately
function dashboardPlan(userId) {
  return {
    user:    { url: '/api/users/' + userId,           method: 'GET' },
    posts:   { url: '/api/posts?user=' + userId,       method: 'GET' },
    metrics: { url: '/api/metrics/' + userId,          method: 'GET' },
  };
}

// The executor — lives at the edge of the system
async function executePlan(plan) {
  const entries = Object.entries(plan);
  const results = await Promise.all(
    entries.map(([key, req]) => fetch(req.url).then(r => r.json()))
  );
  return Object.fromEntries(entries.map(([k], i) => [k, results[i]]));
}

// TESTABLE: test the description without any I/O
const plan = dashboardPlan(42);
assert(plan.user.url === '/api/users/42');    // pure, no fetch!
assert(plan.metrics.method === 'GET');

// EXECUTE once at the edge:
const data = await executePlan(plan);`,
    },
    quiz: {
      question:
        'React components return JSX like <div className="card">...</div>. They do not touch the DOM directly. Which FP concept does this implement?',
      options: [
        'Immutability — JSX objects are frozen and cannot be modified',
        'Description vs Execution — components describe the UI; React decides when and how to execute (DOM updates)',
        'Lazy evaluation — React only renders components when they are visible',
        'Pure functions — React components must be pure functions',
      ],
      correctIndex: 1,
      passFeedback:
        "Exactly! React components are pure descriptions of UI. React holds the execution — it decides when to update the DOM, how to batch changes, whether to render on the server or client. This separation is what enables SSR, concurrent rendering, React Native, and more.",
      failFeedback:
        "B is the core pattern. React components return a description of what the UI should look like — a plain JavaScript object tree. React's runtime is the executor: it decides when to apply changes to the actual DOM. This separation is why React can batch updates, do concurrent rendering, and work on native mobile without changing your components.",
    },
  },

  {
    id: 'immutable-data',
    plain: `Immutable data structures never change after they're created. Instead of modifying them in place, you create a new version with the change applied. The secret to their performance is structural sharing: the new version shares all unchanged parts with the old version. Only the changed path creates new objects — nothing gets copied wholesale.`,
    analogy: `Git commits. When you commit a change to 3 files out of 10,000, git doesn't copy the other 9,997 — they're shared with the previous commit via the object tree. Only the changed files and their parent directory nodes become new objects. Immutable data structures work identically: share unchanged parts, create new nodes only for what changed.`,
    youKnowThis: [
      'React setState / useReducer — always pass a new object, never mutate state directly',
      'Spread operator: {...user, name: "Bob"} — new object sharing all unchanged fields',
      'Immer\'s produce() — writes feel mutable but Immer creates a new immutable snapshot',
      'Redux — every action produces a new state; you can replay the full history',
      'Git — every commit is an immutable snapshot; history is never lost',
    ],
    applyWhen: [
      'Undo/redo features — keep a list of state snapshots; immutability makes this free',
      'Time-travel debugging (Redux DevTools) — replay any past state exactly',
      'Concurrent reads — multiple threads can read the same immutable value simultaneously with no locks',
      'Caching — immutable values can be safely cached and shared because they can never change',
      'Any time a bug might be caused by shared mutable state — make it immutable and the bug disappears',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// MUTABLE — modifying in place (dangerous)
const user = { name: 'Alice', role: 'viewer', age: 30 };
function promoteUser(u) {
  u.role = 'admin'; // mutates the original!
  return u;
}
const promoted = promoteUser(user);
console.log(user.role);     // 'admin' — original changed!
console.log(promoted === user); // true — same object

// IMMUTABLE — structural sharing
function promoteUser(u) {
  return { ...u, role: 'admin' }; // new object, shares name and age
}
const promoted = promoteUser(user);
console.log(user.role);          // 'viewer' — original safe
console.log(promoted.role);      // 'admin'
console.log(promoted === user);  // false — different objects

// Structural sharing in action (linked list):
// Original: A(1) → B(2) → C(3)
// Prepend 0: D(0) → A(1) → B(2) → C(3)
// Nodes A, B, C are SHARED — nothing was copied

// This is why React + Redux are fast despite "copying" state:
function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_NAME':
      // Only 'name' is new; all other fields are shared
      return { ...state, name: action.name };
    default:
      return state; // same reference — no copy at all
  }
}`,
    },
    quiz: {
      question: 'You have a tree with 50,000 nodes. You update one leaf. With structural sharing, how many new nodes are created?',
      options: [
        '50,000 — the entire tree must be copied',
        'Only the nodes on the path from root to the changed leaf (~17 for a balanced tree)',
        'Just 1 — only the changed leaf',
        '2 — the old leaf and the new leaf',
      ],
      correctIndex: 1,
      passFeedback: 'Correct! Only the path from root to the changed leaf needs new nodes. Every other branch is shared with the old version. For a balanced 50,000-node tree, that\'s about log₂(50000) ≈ 16 new nodes.',
      failFeedback: 'B — structural sharing rebuilds only the path from root to the changed node. Every other subtree is shared. For a balanced tree with 50,000 nodes, that\'s roughly 16 new nodes out of 50,000 — about 0.03% allocation.',
    },
  },

  {
    id: 'functor',
    plain: `A functor is any container or context that supports map — applying a function to the value(s) inside without changing the container's shape. Arrays, Promises, Option/Maybe, Result/Either — all are functors. The one rule: mapping the identity function must leave things unchanged. That's it.`,
    analogy: `A sealed package with a modification port. You slide a function through the port, it transforms whatever's inside, and you get back a new sealed package of the same type with the result. The package never opens — the outer shape is preserved. A box of apples mapped with "peel" is still a box; it just contains peeled apples now.`,
    youKnowThis: [
      'Array.map(x => x * 2) — transforms each element, array shape preserved',
      'Promise.then(val => val.toUpperCase()) — transforms the resolved value, still a Promise',
      'Optional chaining: user?.name — safe transformation, preserves the "might be absent" context',
      'React: component is conceptually a functor — maps data (props) to UI without changing the type',
      'SQL SELECT expressions: SELECT UPPER(name) FROM users — transforms values, same table shape',
    ],
    applyWhen: [
      'Transform a value inside a context without unwrapping it: Option.map, Promise.then, array.map',
      'When you have the simplest context-aware operation needed — prefer functor over applicative or monad when map is sufficient',
      'Building abstractions: any custom container should implement map to be composable with the ecosystem',
      'Understanding the hierarchy: Functor < Applicative < Monad. Start here before reaching for monad.',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// Every functor has map. It transforms the inside, preserves the shape.

// Array — shape (length) preserved
[1, 2, 3].map(x => x * 2);         // → [2, 4, 6] (still 3 elements)
[1, 2, 3].map(x => String(x));     // → ['1','2','3'] (still 3 elements)

// Option/Maybe — shape (present/absent) preserved
Some(5).map(x => x + 1);           // → Some(6)
None.map(x => x + 1);              // → None  (no crash, shape preserved)

// Promise — shape (async) preserved
Promise.resolve(5)
  .then(x => x * 2);               // → Promise<10>, still a Promise

// Result/Either — transforms success, leaves error untouched
Right(42).map(x => x.toString());  // → Right('42')
Left('error').map(x => x + 1);     // → Left('error'), unchanged

// THE FUNCTOR LAW:
// map(x)(identity) must equal x
// Mapping identity changes nothing — the structure is preserved
[1,2,3].map(x => x);               // → [1,2,3] ✓

// filter() is NOT a functor operation:
[1,2,3,4,5].filter(x => x > 3);   // → [4,5] — shape CHANGED (5→2 elements)
// Functor map must preserve shape. filter breaks this rule.`,
    },
    quiz: {
      question: 'Which of these is NOT a valid functor (map) operation?',
      options: [
        'array.map(x => x * 2) — transforms each number',
        'promise.then(val => val.toUpperCase()) — transforms the resolved string',
        'option.map(user => user.name) — extracts name if user is present',
        'array.filter(x => x > 0) — keeps only positive numbers',
      ],
      correctIndex: 3,
      passFeedback: 'Right! filter changes the shape — a 10-element array might become a 3-element array. Functor\'s map must preserve the container\'s shape. A 10-element array mapped is always a 10-element array.',
      failFeedback: 'D (filter) is not a functor operation. Functor\'s defining rule: map must preserve the container\'s shape. A 10-element array mapped is always 10 elements. filter changes the element count, breaking shape-preservation.',
    },
  },

  {
    id: 'api-first-design',
    plain: `Design the ideal user-facing interface before thinking about implementation. Ask "what would the perfect call site look like?" — the simplest, most readable way a caller would use this. Then work backward: what types does that usage demand? What laws must those types satisfy? Let the desired usage drive the design.`,
    analogy: `An architect draws blueprints before builders pour concrete. The blueprint is the API — what the occupants need from the building. You don't start by deciding how to wire the walls or pour the foundation. You start from: "People need to cook here, sleep here, work here." The structural requirements follow from human needs, not vice versa.`,
    youKnowThis: [
      'Test-Driven Development (TDD): write the test (the call site) before the implementation',
      'GraphQL schema-first: define the query API before writing resolvers',
      'OpenAPI/Swagger: define the REST contract before implementing endpoints',
      'README-Driven Development: write the README (ideal usage docs) before writing code',
      'User story mapping: define what users do before designing the database schema',
    ],
    applyWhen: [
      'Starting a new module, library, or service — write example usage first',
      'When you\'re stuck on implementation — forget implementation, design the dream call site',
      'Refactoring a confusing API — ask "what would ideal usage look like?" and work toward that',
      'Designing internal service interfaces — start with the consumer\'s perspective',
      'Any time your implementation is driving the API shape rather than the other way around',
    ],
    code: {
      label: 'JavaScript / TypeScript',
      snippet: `// STEP 1: Write the dream call site FIRST — before any implementation
// What should running parallel tasks look like?
const [user, settings, perms] = await parallel(
  fetchUser(userId),
  fetchSettings(userId),
  fetchPermissions(userId),
);
// Clean. No boilerplate. This is what I want users to write.

// STEP 2: What types does that usage demand?
// parallel() takes multiple Tasks and returns a Task of a tuple.
// A Task<A> must be a description of a computation producing A.
type Task<A> = () => Promise<A>;

// STEP 3: What operations must exist?
function unit<A>(a: A): Task<A> {
  return () => Promise.resolve(a);
}
function map<A, B>(task: Task<A>, f: (a: A) => B): Task<B> {
  return () => task().then(f);
}
function parallel<A, B, C>(
  a: Task<A>, b: Task<B>, c: Task<C>
): Task<[A, B, C]> {
  return () => Promise.all([a(), b(), c()]) as Promise<[A,B,C]>;
}

// STEP 4: Notice — the call site DROVE us to Promise.all.
// We didn't plan it upfront. We discovered it by asking:
// "Given this call site, what implementation makes it work?"
// API-first design makes the right implementation obvious.`,
    },
    quiz: {
      question: 'You are building a retry library. What should you design first?',
      options: [
        'The internal timer and backoff algorithm implementation',
        'The thread or async mechanism for scheduling retries',
        'The ideal call site: retry(3, fetchUser) or withRetry({ attempts: 3, delay: 100 })(fetchUser)',
        'The error types that represent retry failures',
      ],
      correctIndex: 2,
      passFeedback: 'Exactly right! Start with the call site you wish existed. retry(3, fetchUser) vs withRetry({attempts:3})(fetchUser) are very different APIs with different tradeoffs. Make that decision first, then let implementation follow.',
      failFeedback: 'C — the call site. The FP book builds an entire parallel computing library starting from "what should fork(task1, task2) look like?" before writing any implementation. Once you know the ideal API, the types and implementation become obvious.',
    },
  },

  {
    id: 'laws-as-design',
    plain: `Every meaningful abstraction has laws — equations that any correct implementation must satisfy. Writing these down and expressing them as property-based tests is the most powerful verification technique in software. Laws catch bugs that types, code review, and hand-written tests all miss — including bugs that cause deadlocks and race conditions.`,
    analogy: `Physics. F = ma is not documentation — it's a constraint. Any physical model that violates it is wrong, period. Software laws work identically: if your map implementation violates map(x)(identity) === x, your implementation is wrong regardless of whether your unit tests pass. Laws are executable specifications, not suggestions.`,
    youKnowThis: [
      'Idempotency in HTTP: PUT /users/1 called twice gives the same result as once — that\'s a law',
      'Database ACID: after a rollback, state must equal state before the transaction — that\'s a law',
      'Cache transparency: with-cache and without-cache must produce the same observable result — law',
      'JSON round-trip: JSON.parse(JSON.stringify(x)) must equal x — a law you can test',
      'Sort stability: equal elements must appear in their original relative order — a law',
    ],
    applyWhen: [
      'Designing any abstraction (cache, queue, event bus) — write its laws before implementing',
      'Serialization/deserialization — the round-trip law: decode(encode(x)) === x',
      'Any commutative operation — order(a, b) === order(b, a)',
      'API idempotency — verify with property tests across random inputs',
      'Any time you have a rule that "should always be true" — express it as a law and test it automatically',
    ],
    code: {
      label: 'JavaScript (fast-check)',
      snippet: `import fc from 'fast-check';

// FUNCTOR LAWS — any correct functor must satisfy both
// Law 1: map with identity must change nothing
test('functor: identity law', () => {
  fc.assert(fc.property(fc.array(fc.integer()), arr => {
    const result = arr.map(x => x);
    return JSON.stringify(result) === JSON.stringify(arr);
  }));
});

// Law 2: two maps must equal one map with composed functions
test('functor: composition law', () => {
  const double = (x: number) => x * 2;
  const addOne = (x: number) => x + 1;
  fc.assert(fc.property(fc.array(fc.integer()), arr => {
    const twoMaps = arr.map(double).map(addOne);
    const oneMap  = arr.map(x => addOne(double(x)));
    return JSON.stringify(twoMaps) === JSON.stringify(oneMap);
  }));
});

// THE DEADLOCK THE BOOK FOUND WITH LAWS:
// Law: fork(computation) should equal computation
// (forking shouldn't change the result)
//
// Writing this law and testing it revealed:
// If fork blocks a thread waiting for a result,
// and the thread pool has exactly 1 thread,
// the thread is blocked waiting for itself → DEADLOCK
//
// This bug was invisible to: code review, unit tests, type checking.
// Only the law test exposed it by generating the edge case.

// ROUND-TRIP LAW — serialize/deserialize must be inverses
test('JSON round-trip law', () => {
  fc.assert(fc.property(fc.jsonValue(), data => {
    return JSON.stringify(JSON.parse(JSON.stringify(data)))
      === JSON.stringify(data);
  }));
});`,
    },
    quiz: {
      question: 'Your map() passes the identity law: map(x)(v => v) === x. But it fails the composition law: map(map(x)(f))(g) !== map(x)(v => g(f(v))). What does this tell you?',
      options: [
        'The composition law is optional — identity is the only required law',
        'Your map has a bug. Both laws are mandatory for any correct functor.',
        'The test framework has a bug — these should be equivalent',
        'This only matters in statically typed languages like Haskell',
      ],
      correctIndex: 1,
      passFeedback: 'Correct! Both functor laws are mandatory constraints. Passing identity but failing composition means your map has a bug — perhaps it applies effects or changes ordering in subtle ways. The law test found what code review missed.',
      failFeedback: 'B — both laws are mandatory. A functor that passes identity but fails composition has a bug. The composition law (two maps = one composed map) is essential for optimization and reasoning. Violating it means callers cannot refactor safely.',
    },
  },

  {
    id: 'trampolining',
    plain: `Trampolining converts deep recursion into a loop that never overflows the stack. Instead of calling the next step (which adds a stack frame), you return a description of the next step — a thunk (a zero-argument function). A simple loop then calls each thunk one at a time. Stack depth stays at O(1) regardless of how many steps there are.`,
    analogy: `Instead of stacking meetings inside meetings (each one waiting for the inner one to finish — which fills your schedule forever), you write each next action on a sticky note and put it in a queue. One worker processes the queue one note at a time. The queue lives on a desk (heap) which is practically unlimited. The stack of nested meetings is the problem; the queue is the solution.`,
    youKnowThis: [
      'JavaScript\'s event loop: tasks are queued, not nested. Async callbacks don\'t stack — they queue.',
      'Node.js setImmediate / process.nextTick: defers the next step instead of calling it directly',
      'Iterative tree traversal with an explicit stack (array): same idea — heap replaces call stack',
      'Continuation-passing style (CPS): passing "what to do next" as a function argument',
      'The call stack IS the problem. Any while loop with a queue is a trampoline.',
    ],
    applyWhen: [
      'Deep recursion that crashes with "Maximum call stack size exceeded" or stack overflow',
      'Processing deeply nested structures: deep JSON, ASTs, recursive data types',
      'Mutual recursion between many functions (A calls B calls A calls B...)',
      'Implementing interpreters, compilers, or state machines that run for many steps',
      'Any recursive algorithm on data with unknown/unbounded depth',
    ],
    code: {
      label: 'JavaScript',
      snippet: `// NAIVE RECURSION — crashes on large inputs
function sumTo(n: number): number {
  if (n === 0) return 0;
  return n + sumTo(n - 1); // each call adds a stack frame
}
sumTo(100000); // → RangeError: Maximum call stack size exceeded

// TRAMPOLINED — O(1) stack, works on any n
type Thunk<A> = () => A | Thunk<A>;

function sumToTramp(n: number, acc = 0): number | Thunk<number> {
  if (n === 0) return acc;
  return () => sumToTramp(n - 1, acc + n); // return a THUNK, not a call
}

function trampoline<A>(fn: (...args: unknown[]) => A | Thunk<A>) {
  return function(...args: unknown[]): A {
    let result = fn(...args);
    while (typeof result === 'function') {
      result = result(); // call the thunk — stack stays at depth 1
    }
    return result as A;
  };
}

const safeSumTo = trampoline(sumToTramp);
safeSumTo(100000); // → 5000050000 ✓ no overflow

// Why it works:
// Recursive:    call → call → call → call (N frames deep) → BOOM
// Trampolined:  call → thunk → loop → thunk → loop (always 1 frame)

// Real-world: trampolining is built into many FP libraries
// Cats Effect (Scala), ZIO, and Haskell's RTS all use this internally`,
    },
    quiz: {
      question: 'Your recursive function crashes with "Maximum call stack size exceeded" on lists of 50,000+ items. What is the most direct fix?',
      options: [
        'Increase the stack size limit in Node.js: --stack-size=65536',
        'Split the list into chunks of 1,000 and process each chunk separately',
        'Convert to a trampoline: return a thunk () => nextCall() instead of calling directly, then drive with a while loop',
        'Use async/await to run each step asynchronously',
      ],
      correctIndex: 2,
      passFeedback: 'Correct! Trampolining eliminates stack growth entirely. Return a thunk instead of recursing, and a while loop processes thunks one at a time. Stack depth stays at 1 regardless of input size — it\'s O(1) stack, O(n) heap.',
      failFeedback: 'C is the canonical solution. Return a thunk (() => nextCall()) instead of calling directly. A trampoline loop then calls each thunk: while (result is a function) result = result(). Stack depth never exceeds 1. Increasing stack size (A) just delays the problem; chunking (B) is complex and may not work for non-linear recursion.',
    },
  },

  {
    id: 'stream-processing',
    plain: `A stream processor is a state machine that transforms data as it flows through — emit output, await more input, or halt. Processors compose by piping: each stage's output feeds the next's input. The entire pipeline runs in constant memory regardless of data volume, and resource cleanup (file handles, connections) is guaranteed even when errors occur mid-stream.`,
    analogy: `A water treatment plant. Raw water flows in, through filter stages, UV treatment, pH adjustment — each stage processes water as it arrives, passing results to the next stage. The plant doesn't wait for all the world's water before filtering. Each stage is independent and composable. Pipe them in any order. When a stage shuts down, upstream stages are notified and drain properly.`,
    youKnowThis: [
      'Unix pipes: cat log | grep ERROR | awk \'{print $5}\' | sort | uniq -c — each | is a pipe',
      'Node.js Readable/Writable streams: fs.createReadStream().pipe(transform).pipe(output)',
      'RxJS Observables: observable.pipe(filter(...), map(...), take(10))',
      'Kafka consumers: process one message at a time, commit offset on success',
      'React Streaming SSR: HTML streams to the browser before the full page is ready',
    ],
    applyWhen: [
      'Large file processing (CSV, logs, JSON lines) — read and process one line at a time',
      'Real-time data: sensor feeds, financial ticks, user event streams — process as data arrives',
      'ETL pipelines: extract from source, transform, load to destination — each stage is a stream processor',
      'HTTP streaming responses: send results to the client as they\'re computed',
      'Any situation where loading all data into memory is not feasible or not necessary',
    ],
    code: {
      label: 'JavaScript (Node.js)',
      snippet: `// WRONG: loads the entire 50GB file into memory
import fs from 'fs';
const data = fs.readFileSync('huge.log', 'utf8'); // needs 50GB RAM!
const errors = data.split('\\n').filter(l => l.includes('ERROR'));

// RIGHT: stream processing — constant memory regardless of file size
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { createWriteStream } from 'fs';

async function extractErrors(input: string, output: string) {
  const reader = createInterface({
    input: createReadStream(input),   // reads in ~64KB chunks
  });
  const writer = createWriteStream(output);

  for await (const line of reader) {  // process ONE line at a time
    if (line.includes('ERROR')) {
      writer.write(line + '\\n');      // emit matching line
    }
  }
  writer.close(); // halt: clean up resources
}
// Works identically on 1KB or 1TB files. Memory usage: ~64KB always.

// Composable pipe (RxJS-style concept):
// source → filter → transform → take(100) → sink
// Each stage: Await input → process → Emit output → Await more
// Three states: Emit | Await | Halt

// Unix pipes are the original:
// cat access.log | grep "ERROR" | awk '{print $5}' | sort | uniq -c | head -10
// Each | connects a stream producer to a stream consumer`,
    },
    quiz: {
      question: 'You need to process a 100GB log file to count ERROR occurrences by service name. Which approach works correctly?',
      options: [
        'Read the entire file into a string, split by newline, filter and reduce',
        'Use a streaming approach: read one line at a time, update a counter Map, never load more than one line',
        'Split the file into 100 parts manually and process each in a separate process',
        'Upload the file to a database first, then run a SQL COUNT query',
      ],
      correctIndex: 1,
      passFeedback: 'Exactly right! A streaming approach uses constant memory — perhaps 1KB for the current line and a small Map for counters. It works identically on 100MB or 100GB. The memory used depends on the output size, not the input size.',
      failFeedback: 'B is the stream processing approach. Loading 100GB into a string (A) requires 100GB of RAM. Stream processing reads one line at a time, maintains a small counter Map, and emits counts at the end. Total memory: O(number of distinct service names), not O(file size).',
    },
  },
];

export function getConceptContent(id: string): ConceptContent | undefined {
  return CONCEPT_CONTENT.find(c => c.id === id);
}
