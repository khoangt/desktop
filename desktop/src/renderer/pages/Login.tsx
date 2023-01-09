import React, { useState, useCallback, useEffect } from 'react';
import { Form, Button, Input } from 'antd'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { signIn } from '../api';

interface Form {
  username: string,
  password: string,
}

const Login = () => {
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available');
      return;
    }
    const recTokenResult = await executeRecaptcha('contactForm')
    setToken(recTokenResult)
  }, [executeRecaptcha]);

  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  const onSubmit = async (form: Form) => {
    setLoading(true);
    await handleReCaptchaVerify();
    signIn(form.username, form.password, token || '')
      .then(() => {
        toast.success('Successfully logged in');
        navigate('/profiles');
      })
      .catch((e) => {
        console.error(e);
        toast.error(e.response?.data?.message || e.message);
      })
      .finally(() => {
        setLoading(false);
        setToken(null);
      })
  }

  return (
    <div className="content">
      <div className="center-page">
        <div className="wrapper">
          <h1 className="title">Sign In</h1>

          <p className="note">
            If you don't have an account, create it on
            <a href="https://browser-sandbox.com/auth/sign-up"> our website</a>.
          </p>

          <Form
            name='login'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{ remember: true }}
            onFinish={onSubmit}
          >
            <Form.Item
              label="Username"
              name="username"
              trigger="onChange"
              rules={[
                { required: true, message: 'Please input your username' },
                { max: 255, message: 'Please shorten your username' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              trigger="onChange"
              rules={[
                { required: true, message: 'Please input your password' },
                { max: 255, message: 'Please shorten your password' },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button disabled={loading} type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
