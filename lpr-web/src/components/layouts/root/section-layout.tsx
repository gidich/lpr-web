import React from 'react';
import { Outlet, useLocation, matchRoutes, useParams, generatePath,useNavigate } from 'react-router-dom';
import { NavBar, TabBar } from 'antd-mobile';
import styles from './section-layout.module.css';

export interface LayoutProps {
  tabs: TabProps[];
}

export interface TabProps {
  id: string;
  path: string;
  title: string;
  icon: React.ReactNode;
}

export const SectionLayout: React.FC<LayoutProps> = ({tabs}) => {

  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const createPath = (id: string): string => {
    const tab = tabs.find(item => item.id === id);
    if (typeof tab !== 'undefined') {
     return generatePath(tab.path.replace('*', ''), params);
    }else {
      return '';
    }
  };

  const matchedPages = matchRoutes(tabs, location);
  const matchedKey = matchedPages ? matchedPages[0].route.id ?? "" : "";

  return(
    <div className={styles.app}>
      <div className={styles.top}>
        <NavBar>Test App</NavBar>
      </div>
      <div className={styles.body}>
        <Outlet />
      </div>
      <div className={styles.bottom}>
        <TabBar activeKey={matchedKey} onChange={value => navigate(createPath(value))}>
          {tabs.map(item => (
            <TabBar.Item key={item.id} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
}