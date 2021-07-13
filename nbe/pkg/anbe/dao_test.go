package anbe

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFileDaoCrud(t *testing.T) {
	var dao = NewDao(":memory:")
	assert.Equal(t, 0, len(dao.All()))
	row1 := dao.Create("name1", "mime1")
	assert.Equal(t, "name1", row1.Name)
	assert.Equal(t, "mime1", row1.Mime)
	assert.Equal(t, 1, len(dao.All()))
	row2 := dao.Create("name2", "mime2")
	assert.Equal(t, "name2", row2.Name)
	assert.Equal(t, "mime2", row2.Mime)
	assert.Equal(t, 2, len(dao.All()))
	dao.Delete(row1.ID)
	assert.Equal(t, 1, len(dao.All()))
	dao.Delete(row2.ID)
	assert.Equal(t, 0, len(dao.All()))
}

func TestFileDaoSameNameAllowed(t *testing.T) {
	var dao = NewDao(":memory:")
	assert.Equal(t, 0, len(dao.All()))
	dao.Create("name", "mime1")
	dao.Create("name", "mime2")
	assert.Equal(t, 2, len(dao.All()))
}

func TestFileDaoUpdateName(t *testing.T) {
	var dao = NewDao(":memory:")
	assert.Equal(t, 0, len(dao.All()))
	row1 := dao.Create("name1", "mime1")
	assert.Equal(t, 1, len(dao.All()))
	row2 := dao.Rename(row1.ID, "name2")
	assert.Equal(t, "name2", row2.Name)
	assert.Equal(t, row1.ID, row2.ID)
	//time.Time has nano seconds precision
	assert.NotEqual(t, row1.UpdatedAt, row2.UpdatedAt)
}
