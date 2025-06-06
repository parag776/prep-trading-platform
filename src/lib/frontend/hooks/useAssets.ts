import { Asset } from "@/generated/prisma";
import axios from "axios";
import { useEffect, useState } from "react";

function useAssets() {
  const [assets, setAssets] = useState<Array<Asset> | null>(null);

  useEffect(() => {
    axios.get("/api/assets").then(({ data }) => {
      setAssets(data);
    });
  }, []);

  return assets;
}
