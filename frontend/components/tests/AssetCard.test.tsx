import { render, screen, fireEvent } from '@testing-library/react'
import { AssetCard } from '../Assets/AssetCard'
import { Asset } from '@/types'

const mockAsset: Asset = {
  asset_id: '123',
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'editor',
    first_name: 'Test',
    last_name: 'User',
    date_joined: '2024-01-01T00:00:00Z',
  },
  file: 'test.jpg',
  file_url: 'http://example.com/test.jpg',
  file_type: 'image',
  title: 'Test Asset',
  description: 'Test Description',
  tags: ['test', 'image'],
  version: 1,
  file_size: 1024,
  file_extension: '.jpg',
  metadata_fields: [],
  versions: [],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockOnDelete = jest.fn()

describe('AssetCard', () => {
  it('renders asset information correctly', () => {
    render(<AssetCard asset={mockAsset} />)

    expect(screen.getByText('Test Asset')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('image')).toBeInTheDocument()
    expect(screen.getByText('1 KB')).toBeInTheDocument()
  })

  it('shows tags when available', () => {
    render(<AssetCard asset={mockAsset} />)

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('image')).toBeInTheDocument()
  })

  it('opens delete modal when delete button is clicked', () => {
    render(<AssetCard asset={mockAsset} onDelete={mockOnDelete} />)

    const menuButton = screen.getByLabelText('Options')
    fireEvent.click(menuButton)

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(screen.getByText('Delete Asset')).toBeInTheDocument()
  })
})