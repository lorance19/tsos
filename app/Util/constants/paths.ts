export const LOGIN_URL = '/View/login';
export const UNAUTH_URL = '/View/unauthorized';

export const SIGN_UP = {
    VIEW : '/View/signUp',
    API: '/auth/signUp'
};

export const USER_PROFILE = {
    VIEW : '/View/userProfile',
}
export const LOGOUT = {
    VIEW : '/View/logout',
    API: '/api/logout'
};

export const ADMIN_MANAGEMENTS = {
    USERS: { VIEW: "/admin/management/users"},
    ADD_USER: { VIEW: "/admin/management/users/addNewUser" , API: "/api/admin/addUser" },
    ISSUES: { VIEW: "/admin/management/issues"},
    PRODUCTS: { VIEW: "/admin/management/products"},
}
