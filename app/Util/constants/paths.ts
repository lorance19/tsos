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
    API: '/api/admin/user/',
}

export const USER_PROFILE_ADMIN_VIEW = (userId: string) => ({
    VIEW : `/admin/management/users/userProfile/${userId}`,
    API: `/api/admin/user/${userId}`
})

export const EDIT_PROFILE = (userId: string) => ({
    VIEW: `/View/userProfile/${userId}/editProfile`,
    API: `/api/admin/user/${userId}`
});

export const LOGOUT = {
    VIEW : '/View/logout',
    API: '/api/logout'
};

export const SVG = {
    DEFAULT_IMAGE_SVG: '/images/productPreview/image.svg'
}


export const ADMIN_MANAGEMENTS = {
    //User
    USERS: { VIEW: "/admin/management/users", API: "/api/admin/user"},
    ADD_USER: { VIEW: "/admin/management/users/addNewUser" , API: "/api/admin/user/addUser" },

    ISSUES: { VIEW: "/admin/management/issues"},

    //Product
    PRODUCTS: { VIEW: "/admin/management/products", API: "/api/admin/product" },
    PRODUCT_PROFILE: (productId: string) => ({
        VIEW: `/admin/management/products/${productId}`,
        API: `/api/admin/product/${productId}`
    }),
    ADD_PRODUCT: { VIEW: "/admin/management/products/addNewProduct" , API: "/api/admin/product/addProduct" },
}

//View
export const PRODUCT = {
    LIST : { VIEW : '/View/product', API: '/api/view/product' },
}
