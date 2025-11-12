export const LOGIN_URL = '/View/login';
export const UNAUTH_URL = '/View/unauthorized';
export const UNEXPECTED_URL = '/View/unexpectedError';
export const SIGN_UP = {
    VIEW : '/View/signUp',
    API: '/auth/signUp'
};

export const LOGIN_SUCCESS = {
    API: '/auth/login'
};


export const USER_PROFILE = {
    VIEW : '/View/userProfile',
    API: '/api/admin/user/'
}

export const USER_PROFILE_ADMIN_VIEW = {
    VIEW : '/admin/management/users/userProfile/',
    API: '/api/admin/user/'
}
export const LOGOUT = {
    VIEW : '/View/logout',
    API: '/api/logout'
};

export const ADMIN_MANAGEMENTS = {
    USERS: { VIEW: "/admin/management/users", API: "/api/admin/user"},
    ADD_USER: { VIEW: "/admin/management/users/addNewUser" , API: "/api/admin/user/addUser" },
    ISSUES: { VIEW: "/admin/management/issues"},
    PRODUCTS: { VIEW: "/admin/management/products"},
}
