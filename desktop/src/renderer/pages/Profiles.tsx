import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Button, Spin } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios';
import Avatar from 'boring-avatars';
import type { AxiosError } from 'axios';

import { getInstanceList } from '../api';

const Profiles = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [launching, setLaunching] = useState<boolean>(false);
  const [list, setList] = useState<any[]>([]);

  const onLaunch = (config: any) => {
    setLaunching(true);
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('launch-browser', config);
  }

  useEffect(() => {
    // @ts-ignore
    window.electron.ipcRenderer.once('browser-launch-finish', (data: any) => {
      setLaunching(false);
      data.success ? toast.success('Profile successfully launched.') : toast.error(data.message);
    });
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await getInstanceList();
        setList(data?.profiles);
        // @ts-ignore
      } catch (e: Error | AxiosError) {
        console.error(e);
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 401 || e.response?.status === 403) {
            navigate('/auth/login');
            return;
          }
          toast.error(e.response?.data?.message);
        } else {
          toast.error(e.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [getInstanceList]);

  return (
    <div className="content-inner">
      <div className="row">
        <h1 className="title">Profiles</h1>
        <Spin delay={300} spinning={launching} />
      </div>

      <List
        itemLayout="horizontal"
        dataSource={list}
        loading={loading}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button disabled={launching} onClick={() => onLaunch(item)} type="primary">Launch</Button>
            ]}
          >
            <List.Item.Meta
              title={item.name}
              avatar={
                <Avatar size={45} name={item.name} />
              }
              description={item.description || "Empty description"}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Profiles;
