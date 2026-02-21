import { GlossaryTerm } from './types';

export const GLOSSARY: GlossaryTerm[] = [
  {
    name: 'Pure Function',
    plain: 'A function that always returns the same output for the same input, and does nothing else — no DB calls, no logging, no mutations. Like a calculator.',
    example: 'add(2, 3) → always 5. Never 6. Never throws. Never logs.',
  },
  {
    name: 'Side Effect',
    plain: 'Anything a function does besides computing and returning a value — writing to a database, logging, mutating a variable, sending a network request.',
    example: 'console.log("hi") is a side effect. So is db.save(user).',
  },
  {
    name: 'Referential Transparency',
    plain: 'An expression is referentially transparent if you can replace it with its result everywhere in your code and nothing changes. Like algebra: you can always replace 2+2 with 4.',
    example: 'If f(x) is referentially transparent, then f(f(x)) = f(result).',
  },
  {
    name: 'Immutability',
    plain: 'Never changing data after it\'s created. Instead of modifying an object, create a new one with the changes. React state works this way.',
    example: 'const newUser = {...user, name: "Bob"} instead of user.name = "Bob"',
  },
  {
    name: 'Option / Maybe',
    plain: 'A type that represents a value that might not exist. Either Some(value) or None. Replaces null checks.',
    example: 'findUser(id) returns Option<User> — either Some(user) or None, never null.',
  },
  {
    name: 'Either / Result',
    plain: 'A type that represents success or failure. Either Right(value) (success) or Left(error) (failure with reason).',
    example: 'parseJson(str) returns Either<Error, Data> — Right(data) or Left("invalid JSON").',
  },
  {
    name: 'Functor',
    plain: 'Anything you can map over — apply a function to values inside a container without changing the container\'s shape.',
    example: '[1,2,3].map(x => x*2) → [2,4,6]. The array shape is preserved. Arrays are functors.',
  },
  {
    name: 'Monad',
    plain: 'A pattern for chaining operations where each step might produce a "special" result (failure, multiple values, async). flatMap lets each step choose what comes next.',
    example: 'Promises are monads. .then() is flatMap. Rejection short-circuits the chain.',
  },
  {
    name: 'flatMap / andThen / bind',
    plain: 'The operation that chains monadic steps. It takes a value inside a context, applies a function that returns a new context, and flattens the result.',
    example: 'getUser(id).flatMap(user => getOrders(user.id)) — orders depends on the user.',
  },
  {
    name: 'Applicative',
    plain: 'Like a monad, but for independent operations. map2 combines two effects that don\'t depend on each other. This lets you collect ALL errors, or run things in parallel.',
    example: 'Promise.all([fetchUser, fetchSettings]) is applicative — both run independently.',
  },
  {
    name: 'Monoid',
    plain: 'Any type with an associative "combine" operation and an identity (neutral) element. Because grouping doesn\'t matter, you can split and parallelise freely.',
    example: 'Integers with addition (identity: 0). Strings with concat (identity: ""). Lists with append.',
  },
  {
    name: 'Higher-Order Function (HOF)',
    plain: 'A function that takes other functions as arguments or returns functions. map, filter, and reduce are HOFs.',
    example: 'array.filter(x => x > 5) — filter takes a function as argument.',
  },
  {
    name: 'IO Monad',
    plain: 'A way to describe computations that interact with the world (files, network, console) as pure values. Like writing a recipe rather than cooking. You run the recipe only at the very end.',
    example: 'readFile("x.txt") returns IO<string> — a description of reading. Call run() to actually read.',
  },
  {
    name: 'ADT (Algebraic Data Type)',
    plain: 'A type defined by its possible "shapes". Like an enum but each option can carry data.',
    example: 'type Shape = Circle(radius) | Rectangle(w, h) | Triangle(a, b, c)',
  },
  {
    name: 'Lazy Evaluation',
    plain: 'Don\'t compute a value until it\'s actually needed. The opposite of eager/strict evaluation.',
    example: 'Python generators are lazy — they produce values one at a time, only when asked.',
  },
  {
    name: 'Tail Recursion',
    plain: 'A recursive function where the recursive call is the very last operation. The compiler can convert this to a loop — no stack overflow.',
    example: 'function sum(n, acc=0): if n===0 return acc; return sum(n-1, acc+n)',
  },
  {
    name: 'Type Class',
    plain: 'An interface/contract that multiple unrelated types can implement independently. Like Java interfaces but not requiring inheritance.',
    example: 'Comparable in Java is like a type class — any type can implement it without extending a base class.',
  },
];
