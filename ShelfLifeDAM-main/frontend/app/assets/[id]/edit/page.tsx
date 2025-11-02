'use client'

import { useParams } from 'next/navigation'
import { EditAssetClient } from '@/components/Assets/EditAssetClient'

export default function EditAssetPage() {
  const params = useParams()
  const assetId = params?.id as string

  return <EditAssetClient assetId={assetId} />
}
