export const navItems = [
    {
      title: 'Home',
      url: '/menu',
      icon: 'home',
      isActive: false,
      authRequired: false,
      items: []
    },
    {
      title: 'Account',
      url: '#', 
      icon: 'billing',
      isActive: false,
  
      items: [
        {
          title: 'Profile',
          url: '/u/profile',
          isActive: false,
          authRequired: true
        },
        {
          title: 'Register',
          url: '/accounts/sign-up',
          isActive:false,
          authRequired: false
        },
        {
          title: 'Login',
          url: '/accounts/sign-in',
          isActive: false,
          authRequired: false
        },
      ]
    },
    {
      title: 'Our Centres',
      url: '/centres',
      icon: 'store',
      isActive: false,
      authRequired: false,
    },
    {
      title: 'Dashboard',
      url: '#',
      icon: 'dashboard',
      isActive: false,
      authRequired: true,
      role:'admin',
      items: [
        {
          title: 'Overview',
          url: '/dashboard',
          isActive: false,
        },
        {
          title: 'Missing/Found People',
          url: '/dashboard/people',
          isActive: false,
        },
        {
          title: 'Lost/Found Items',
          url: '/dashboard/items',
          isActive: false,
        },
        {
          title: 'User Claims',
          url: '/dashboard/claims',
          isActive: false,
        },
        {
          title: 'Users',
          url: '/dashboard/users',
          isActive: false,
        },
      ]
    },
  ];