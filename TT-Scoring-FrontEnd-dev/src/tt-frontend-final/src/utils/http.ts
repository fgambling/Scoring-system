//external import

import axios from "axios";
import { Payload } from "@/interface/form-interface";

import {
  SelectedTestContentData,
  TestStatus,
} from "@/interface/test-developer";

const SERVER_BASE_URL = "http://localhost:8081";

export const setDefaultHeader = (accessToken: string) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

// get user token, if exists

export const loginRequest = (username: string, password: string) => {
  const postData = {
    username: username,
    password: password,
  };
  return axios.post(`${SERVER_BASE_URL}/auth/login`, postData);
};

// Fetch admin dashboard user list
export const fetchUsersInfo = async () => {
  return await axios.get(`${SERVER_BASE_URL}/users`);
};

// Submit admin dashboard form request to backend
export const submitRequest = async (payload: Payload) => {
  if (payload.type === "mark") return await markerSubmitRequest(payload);
  else return await adminSubmitRequest(payload);
};

const adminSubmitRequest = async (payload: Payload) => {
  let response = null;
  let roles = null;

  if(payload.roles) {
    roles = payload.roles.split(',');
  }

  if (payload.type === "Delete")
    response = await axios.delete(
      `${SERVER_BASE_URL}/users/by-username/${payload.username}`
    );
  if (payload.type === "Add")
    response = await axios.post(
      `${SERVER_BASE_URL}/users/create`,
      {...(({ type, ...rest }) => rest)(payload), roles, status: 'Active' }
    );
  if (payload.type === "Disable")
    response = await axios.patch(
      `${SERVER_BASE_URL}/users/status-by-username/${payload.username}`
    );
  if (payload.type === "Reset")
    response = await axios.patch(
      `${SERVER_BASE_URL}/users/${payload.username}/password`,
      {
        newPassword: payload.password,
        confirmPassword: payload.re_password,
      }
    );

  return response && { role: "admin", status: response.status };
};

const markerSubmitRequest = async (payload: Payload) => {
  const response = await axios.patch(
    `${SERVER_BASE_URL}/manual-mark/answers/${payload.answer_id}/mark`,
    { newMark: payload.score }
  );

  return response && { role: "marker", status: response.status };
};

export const fetchTestList = async (user_id: string) => {
  const response = await axios.get(
    `${SERVER_BASE_URL}/manual-mark/${user_id}/questions-and-answers`
  );
  return response.data;
};

export const exportFile = async (test_id: string) => {
  const response = await axios.get(
    `${SERVER_BASE_URL}/auto-mark/report/${test_id}`
  );

  console.log(response);
};

//get test list
export const fetchTestListRequest = async () => {
  return await axios.get(`${SERVER_BASE_URL}/tests`);
};

// fetch test by id
export const fetchTestContentRequest = async (id: string) => {
  return await axios.get(`${SERVER_BASE_URL}/tests/${id}`);
};

// fetch test by id
export const duplicateTestRequest = async (id: string) => {
  const postData = {
    id: id,
  };
  return await axios.post(`${SERVER_BASE_URL}/tests/duplicate`, postData);
};
// delete test by id
export const deleteTestRequest = async (id: string) => {
  return await axios.delete(`${SERVER_BASE_URL}/tests/delete/${id}`);
};

// save selected test content
export const saveTestContentRequest = async (
  testContent: SelectedTestContentData
) => {
  return await axios.post(`${SERVER_BASE_URL}/tests/save`, testContent);
};
//generate alternative keys
export const generateAltKeys = async (keys: string[]) => {
  const postKeys = {
    keys: keys,
  };
  return await axios.post(`${SERVER_BASE_URL}/tests/generateKeys`, postKeys);
};

export const uploadNewTestExcelRequest = async (
  testName: string,
  testFile: File
) => {
  const formData = new FormData();
  formData.append("name", testName);
  formData.append("file", testFile);

  return await axios.post(`${SERVER_BASE_URL}/tests/import`, formData);
};

export const autoMarkRequest = async (testId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("_id", testId);

  return await axios.post(`${SERVER_BASE_URL}/auto-mark/start`, formData);

  // below is just simulating the request
  // return new Promise((resolve) =>
  //   setTimeout(
  //     () =>
  //       resolve({
  //         data: {
  //           statusCode: 200,
  //           message: "Auto Marked Successfully",
  //           data: {
  //             status: "auto marked",
  //           },
  //         },
  //       }),
  //     2000
  //   )
  // ); // Simulate network delay
};

// get marked result
export const getMarkedResultRequest = async (id: string) => {
  return await axios.get(`${SERVER_BASE_URL}/auto-mark/report/${id}`);
};

export const getDownloadResult = async (id: string, config = {}) => {
  return await axios.get(`${SERVER_BASE_URL}/auto-mark/download/${id}`, {
    responseType: "blob",
  });
};
export const assignMarker = async (markID: string, testID: string) => {
  const assignedInfo = {
    markerId: markID,
    testId: testID,
  };
  return await axios.post(`${SERVER_BASE_URL}/tests/assign`, assignedInfo);
};

export const fetchMarkers = async () => {
  return await axios.get(`${SERVER_BASE_URL}/auto-mark/markers`);
};
