import { Routes, Route } from 'react-router-dom';
import {
    AppOutline,
    MessageOutline,
    UnorderedListOutline,
    UserOutline,
  } from 'antd-mobile-icons';

import { SectionLayout, TabProps } from './section-layout';
import { Home } from './pages/home';
import { Me } from './pages/me';
import { Message } from './pages/message';
import { Todo } from './pages/todo';

const tabs: TabProps[] = [
  {
    id: 'ROOT',
    path: '/',
    title: 'Home',
    icon: <AppOutline />,
  },
  {
    id: 'TODO',
    path: '/todo',
    title: 'Tasks',
    icon: <UnorderedListOutline />,
  },
  {
    id: 'MESSAGE',
    path: '/message',
    title: 'Messages',
    icon: <MessageOutline />,
  },
  {
    id: 'ME',
    path: '/me',
    title: 'Profile',
    icon: <UserOutline />,
  },
]

export const Root: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<SectionLayout tabs={tabs} />}>
        <Route path="/" element={<Home />} />
        <Route path="/me" element={<Me />} />
        <Route path="/message" element={<Message />} />
        <Route path="/todo" element={<Todo />} />
      </Route>
    </Routes>
  )
}