import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";

function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => console.log(error),
  });

  const GetUserProfile = (tokenInfo) => {
    console.log("Access Token:", tokenInfo?.access_token);
    setLoading(true);
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "application/json",
          },
        }
      )
      .then((resp) => {
        console.log("User Profile:", resp);
        localStorage.setItem("user", JSON.stringify(resp.data));
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="p-3 flex justify-between items-center px-5 bg-transparent absolute top-0 left-0 w-full z-50">
      <div className="flex items-center" style={{ gap: "8px" }}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: "70px", height: "auto" }}
        />
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#FFFFFF",
            textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          PotherPanchali.AI
        </span>
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <a href="/">
              <Button
                variant="outline"
                className="rounded-full bg-[#B8860B] text-white hover:bg-[#B8860B] border-none"
                style={{ fontFamily: "Edmund, serif" }}
              >
                Home
              </Button>
            </a>
            <a href="/my-trips">
              <Button
                variant="outline"
                className="rounded-full bg-[#B8860B] text-white hover:bg-[#B8860B] border-none"
                style={{ fontFamily: "Edmund, serif" }}
              >
                My Trips
              </Button>
            </a>
            <Popover>
              <PopoverTrigger>
                <img
                  src={user?.picture}
                  className="h-[35px] w-[35px] rounded-full"
                  alt="User Avatar"
                />
              </PopoverTrigger>
              <PopoverContent
                className="p-2 bg-white rounded-md shadow-md border w-32 text-center"
                align="end"
                sideOffset={8}
              >
                <h3
                  className="cursor-pointer"
                  onClick={() => {
                    googleLogout();
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Log Out
                </h3>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button onClick={() => setOpenDialog(true)}>Sign In</Button>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              <img
                src={logo}
                alt="Logo"
                style={{ width: "60px", height: "auto" }}
              />
              <h2 className="font-bold text-lg mt-7">Sign In with Google</h2>
              <p>
                Securely sign in to our Application with Google Authentication
              </p>
              <Button
                disabled={loading}
                onClick={login}
                className="w-full mt-5 flex gap-4 items-center"
              >
                <FcGoogle className="h-7 w-7" />
                Sign In with Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Header;
