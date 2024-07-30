"use client";
import { useUserContext } from "@/context/UserContext";
import { Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const AdminPage = () => {
  // hooks -------------------------------------------------------------------
  const router = useRouter();
  const { userName, userId } = useUserContext();
  // handlers ----------------------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  const handleChooseRole = () => {
    router.push("/auth");
  };

  const handleToDashboard = () => {
    router.push("/auth/pages/dashboard");
  };

  // jsx ---------------------------------------------------------------------
  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Typography component="h1" variant="h2" align="center" mb={8}>
        Admin: {userName}
      </Typography>
      <Typography component="span" align="center" mb={8}>
        userId: {userId}
      </Typography>
      <Button
        type="button"
        variant="contained"
        fullWidth
        sx={{
          mt: 4,
          fontSize: "1.2rem",
          color: "black",
          fontWeight: "bold",
        }}
        size="large"
        color="info"
        onClick={handleLogout}
      >
        Logout
      </Button>
      <Button
        type="button"
        variant="contained"
        fullWidth
        sx={{
          mt: 4,
          fontSize: "1.2rem",
          color: "black",
          fontWeight: "bold",
        }}
        size="large"
        color="info"
        onClick={handleChooseRole}
      >
        Choose Role
      </Button>
      <Button
        type="button"
        variant="contained"
        fullWidth
        sx={{
          mt: 4,
          fontSize: "1.2rem",
          color: "black",
          fontWeight: "bold",
        }}
        size="large"
        color="info"
        onClick={handleToDashboard}
      >
        Access to Dashboard
      </Button>
    </Container>
  );
};

export default AdminPage;
