import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import * as authApi from "../api/auth";
import { setCredentials, logout as logoutAction } from "../store/authSlice";

export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      dispatch(
        setCredentials({
          user: response.data.user,
        }),
      );
    },
  });
};

export const useRegister = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      dispatch(
        setCredentials({
          user: response.data.user,
        }),
      );
    },
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(logoutAction());
      queryClient.clear();
    }
  };
};
