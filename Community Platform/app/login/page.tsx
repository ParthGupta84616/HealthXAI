"use client";
import { LockOutlined } from "@mui/icons-material";
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import React, { useEffect } from "react"; 
import{ useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const Router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  })
  useEffect(() => {
    if(user.email.length > 0 && user.password.length > 0) {
      
      setButtonDisabled(false);

  }else{
      setButtonDisabled(true);
  }
  
    
  }, [user])
  

  const handleLogin = async () => {
      if(!buttonDisabled){
          setLoading(true);
          try {
              const response =await axios.post('/api/users/login', user);
              console.log("Signup success", response.data);
              Router.push("/");
  
          } catch (error: any) {
              setLoading(false);
              setButtonDisabled(false);
              console.log(error.message)
              
          }
      }
  };

  // const handleLogin = () => {};

  return (
    <>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h5">Login</Typography>
          <Box sx={{ mt: 1 }}>
          <form onSubmit={(event) => {
  event.preventDefault(); // Prevent the default form submit action
  handleLogin(); 
}}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoFocus
              value={user.email}
              onChange={(e) => setUser({...user, email: e.target.value})}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={user.password}
              onChange={(e) => setUser({...user, password: e.target.value})}
            />

              <Button
              type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={()=>handleLogin()}
                disabled={loading} 
                startIcon={loading ? <CircularProgress size={24} /> : null} 
                >
                {loading ? 'Loging up...' : 'Login'} 
                </Button>
            </form>
            <Grid container justifyContent={"flex-end"}>
              <Grid item>
                <Link href="/signup">Don&apos;t have an account? Register</Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Login;