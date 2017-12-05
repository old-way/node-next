import 'babel-polyfill';
import React from 'react';
import ReactDom from 'react-dom';

import {
    Admin,
    Resource,
    Delete,
} from 'react-admin';
import jsonRestDataProvider from 'ra-data-fakerest';
import englishMessages from 'ra-language-english';

import addUploadFeature from './addUploadFeature';

import {
    PostList,
    PostCreate,
    PostEdit,
    PostShow,
    PostIcon,
} from './posts';
import {
    CommentList,
    CommentEdit,
    CommentCreate,
    CommentShow,
    CommentIcon,
} from './comments';
import {
    UserList,
    UserEdit,
    UserCreate,
    UserIcon,
    UserShow,
} from './users';
import Layout from 'layout/Layout';

import data from './data';
import * as customMessages from './i18n';
import authClient from './authClient';

const messages = {
    cn: { ...customMessages.cn },
    en: { ...englishMessages, ...customMessages.en },
};

const dataProvider = jsonRestDataProvider(data, true);
const uploadCapableDataProvider = addUploadFeature(dataProvider);
const delayedDataProvider = (type, resource, params) =>
    new Promise(resolve =>
        setTimeout(
            () => resolve(uploadCapableDataProvider(type, resource, params)),
            1000,
        ),
    );

ReactDom.render(
    <Admin
        authClient={ authClient }
        dataProvider={ delayedDataProvider }
        locale='cn'
        appLayout={ Layout }
        messages={ messages }
        title='Notadd Administration'
    >
        { permissions => [
            <Resource
                name='posts'
                list={ PostList }
                create={ PostCreate }
                edit={ PostEdit }
                show={ PostShow }
                remove={ Delete }
                icon={ PostIcon }
            />,
            <Resource
                name='comments'
                list={ CommentList }
                create={ CommentCreate }
                edit={ CommentEdit }
                show={ CommentShow }
                remove={ Delete }
                icon={ CommentIcon }
            />,
            permissions ? (
                <Resource
                    name='users'
                    list={ UserList }
                    create={ UserCreate }
                    edit={ UserEdit }
                    remove={ Delete }
                    icon={ UserIcon }
                    show={ UserShow }
                />
            ) : null,
            <Resource name='tags'/>,
        ] }
    </Admin>,
    document.getElementById('root'),
);
