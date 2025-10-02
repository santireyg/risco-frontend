// app/profile/components/ProfileTabs.tsx

import React from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { UserIcon, KeyIcon } from "@heroicons/react/24/outline";

import { UserProfile } from "../../context/AuthContext";

import ProfileView from "./ProfileView";
import ProfileEditForm from "./ProfileEditForm";
import PasswordChangeForm from "./PasswordChangeForm";

interface ProfileTabsProps {
  user: UserProfile;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ user }) => {
  return (
    <div className="w-full">
      <Tabs
        aria-label="Opciones de perfil"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
        color="primary"
        variant="underlined"
      >
        <Tab
          key="view"
          title={
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span>Ver Perfil</span>
            </div>
          }
        >
          <div className="py-6">
            <ProfileView user={user} />
          </div>
        </Tab>

        <Tab
          key="edit"
          title={
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span>Editar Perfil</span>
            </div>
          }
        >
          <div className="py-6">
            <ProfileEditForm />
          </div>
        </Tab>

        <Tab
          key="password"
          title={
            <div className="flex items-center space-x-2">
              <KeyIcon className="h-4 w-4" />
              <span>Cambiar Contraseña</span>
            </div>
          }
        >
          <div className="py-6">
            <PasswordChangeForm />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
