# Contributing

Thanks for contributing! 👍

## Setting up your environment

You'll want to create a fork first, then this should get you going:

```sh
git clone https://github.com/<your-user>/shallow-render.git
cd shallow-render
npm install
npm run build:all
```

If that all passes, you're good!

## Code formatting and linting

For now, there's just TSLint.
`npm run lint`
-- or --
`npm run lint:fix`

## Architectural Rules

### Third party packages

Please avoid adding new packages. We have to support old and new versions of Angular and the fewer dependencies we have, the easier it is to keep this compatibility.

### Type Safety

Public contracts should **always** be type-safe. I understand that Angular constantly breaks out of the type system but `shallow-render` is meant to encourage staying in the type-system as much as possible. If a feature cannot be done in a type-safe manner, we should seriously consider abandoning the feature.

### Test Coverage

- All new code should have solid coverage with unit tests
- All new features should be exercised in the `examples` folder

### No funny business

- Avoid _magic_ whenever possible, err on the side of being explicit
- If you have to do something weird because of Angular, please leave a detailed comment in the code for why things got weird
