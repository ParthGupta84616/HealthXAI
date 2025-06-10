"use client";
import { LockOutlined } from "@mui/icons-material";
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { set } from "mongoose";


const Verifyemail = () => {
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [token, setToken] = useState("");
  const Router = useRouter();
  
  useEffect(() => {
    const urlToken = window.location.href.split("token=")[1];
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);
  const fetchData = async () => {
    try {
      setButtonDisabled(true);
      setLoading(true);
      const response = await axios.post('/api/users/profile');
      console.log(response)
      if(response.data.user.isVerified){
        Router.push("/profile");
      }
      else{
        setButtonDisabled(false);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.message);
      setButtonDisabled(false);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  },[]);
  
  useEffect(() => {
    const doAsync = async () => {
      if (token.length > 0) {
        setButtonDisabled(true);
        setLoading(true);
        try {
          const response = await axios.post('/api/users/verifyemail', { token });
          console.log("Verification Success", response.data);
          Router.push("/login");
        } catch (error: any) {
          console.error("Verification Failed", error.message);
          setButtonDisabled(false);
        }
      }
    };
    doAsync();
  }, [token, Router]);

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
          <Typography variant="h5">Verify Email</Typography>
          <Box sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={buttonDisabled}
              startIcon={loading ? <CircularProgress size={24} /> : null}
              onClick={fetchData}
            >
              {loading ? 'Verifying Email...' : 'Verify Email'}
            </Button>
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

export default Verifyemail;
