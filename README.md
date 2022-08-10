# Add component into npm store locally

    yarn link

# Link your component into your main project

Go to core directory of your main project

    yarn link <package-name in package.json>

## Command using for development

Load dependency

    yarn install

To start development in local machine

    yarn start

To compile as a class for your main project

    yarn run build

# Configuration routes and menus from your component in src/interface directory

    interface/menus.js

```javascript
export const RoutesConfig = [
  {
    path: '/dashboard', // Route name
    component: TestComponents, // Component

    // Permissible configuration using to authorizing user from
    // their bearer
    //
    // View more on https://github.com/brainhubeu/react-permissible

    permissible: {
      requiredPermissions: ['admin'],
    },
  },
  {
    path: '/prohibit',
    component: FirstComponents,
    permissible: {
      requiredPermissions: ['prohibit'],
    },
  },
]
```

    interface/routes.js

```javascript
const MenuConfig = [
  {
    // First menu
    text: 'Dashboard Menu', // Text to display in menu
    icon: 'team', // antd icon view more on https://ant.design/components/icon/
    link: '/dashboard', // URL to route. can add more on integration/routes.js file

    // Permissible configuration using to authorizing user from
    // their bearer
    permissible: {
      requiredPermissions: ['admin'],
    },
  },

  // second menu
  {
    text: 'Dashboard Sub Menu',
    icon: 'team',
    permissible: {
      requiredPermissions: ['admin'],
    },

    // sub menu configure
    subMenu: [
      {
        text: 'Prohibit route',
        icon: 'team',
        link: '/prohibit',
        permissible: {
          requiredPermissions: ['admin'],
        },
      },
      {
        text: 'Dashboard invisible',
        icon: 'team',
        link: '/dashboard_invisible',

        permissible: {
          requiredPermissions: ['invisible'],
        },
      },
    ],
  },
  {
    text: 'User Menu',
    icon: 'user',
    link: '/user/list',
    permissible: {
      requiredPermissions: ['admin'],
    },

    subMenu: [
      {
        text: 'Create user',
        icon: 'user-add',
        link: '/user/create',
        permissible: {
          requiredPermissions: ['admin'],
        },
      },
      {
        text: 'List user',
        icon: 'user',
        link: '/user/list',
        permissible: {
          requiredPermissions: ['admin'],
        },
      },
    ],
  },
]
```
