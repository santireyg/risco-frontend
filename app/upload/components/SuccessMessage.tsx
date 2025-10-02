// app/upload/components/SuccessMessage.tsx

import React from "react";
import { Alert, List, Divider } from "antd";
import { Button } from "@heroui/button";
import Link from "next/link";
import { FilePdfOutlined, HomeOutlined } from "@ant-design/icons";

interface SuccessMessageProps {
  uploadedFileNames: string[];
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  uploadedFileNames,
}) => (
  <Alert
    description={
      <div>
        <Divider className="my-3" />
        <p className="text-md font-regular text-foreground-600">
          Los siguientes archivos han sido subidos exitosamente y están siendo
          procesados.
        </p>
        <List
          dataSource={uploadedFileNames}
          itemLayout="vertical"
          renderItem={(item) => (
            <List.Item className="text-md font-regular text-foreground-600 ">
              <FilePdfOutlined style={{ marginRight: 8, color: "#d32f2f" }} />-{" "}
              {item}
            </List.Item>
          )}
          size="small"
          split={false}
        />
        <Divider className="mb-2" />
        <div className="flex justify-between items-center">
          <p className="text-md font-regular text-foreground-600">
            Ve a la página principal para consultar el estado de progreso.
          </p>
          <Link href="/">
            <Button
              color="primary"
              radius="lg"
              size="sm"
              startContent={<HomeOutlined />}
              variant="flat"
            >
              Home
            </Button>
          </Link>
        </div>
      </div>
    }
    message={<h1 className="text-lg text-foreground-900">Carga exitosa</h1>}
    showIcon={false}
    style={{ alignItems: "center" }}
    type="success"
  />
);

export default SuccessMessage;
